package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"stationMonitor/internal/config"
	"stationMonitor/internal/database"
	"stationMonitor/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type Claims struct {
	Username string `json:"username"`
	jwt.RegisteredClaims
}

func Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Find user in MongoDB (try username first, then email)
	var user models.User
	collection := database.Database.Collection("users")

	// Try to find by username or email
	filter := bson.M{
		"$or": []bson.M{
			{"username": req.Username},
			{"email": req.Username},
		},
	}

	err := collection.FindOne(c.Request.Context(), filter).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Load config to get JWT secret
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration error"})
		return
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	// Use email as username in JWT if username is empty (for email-only users)
	jwtUsername := user.Username
	if jwtUsername == "" {
		jwtUsername = user.Email
	}
	claims := &Claims{
		Username: jwtUsername,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return response
	response := models.LoginResponse{
		Token: tokenString,
		User: models.User{
			ID:       user.ID,
			Email:    user.Email,
			Username: user.Username,
		},
	}

	c.JSON(http.StatusOK, response)
}

func Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	collection := database.Database.Collection("users")

	// Check if user with this email already exists
	var existingUser models.User
	err := collection.FindOne(c.Request.Context(), bson.M{"email": req.Email}).Decode(&existingUser)
	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User with this email already exists"})
		return
	}
	if err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// Create new user
	newUser := models.User{
		ID:       primitive.NewObjectID(),
		Email:    req.Email,
		Password: string(hashedPassword),
	}

	_, err = collection.InsertOne(c.Request.Context(), newUser)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	// Load config to get JWT secret
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration error"})
		return
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &Claims{
		Username: newUser.Email, // Use email as username in JWT
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Return response
	response := models.RegisterResponse{
		Token: tokenString,
		User: models.User{
			ID:    newUser.ID,
			Email: newUser.Email,
		},
		Message: "User registered successfully",
	}

	c.JSON(http.StatusCreated, response)
}

func VerifyToken(c *gin.Context) {
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration error"})
		c.Abort()
		return
	}

	tokenString := c.GetHeader("Authorization")
	if tokenString == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
		c.Abort()
		return
	}

	// Remove "Bearer " prefix if present
	if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
		tokenString = tokenString[7:]
	}

	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWT.Secret), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return
	}

	c.Set("username", claims.Username)
	c.Next()
}

func Dashboard(c *gin.Context) {
	username, exists := c.Get("username")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Welcome to the dashboard",
		"user":    username,
	})
}

// GoogleOAuthLogin initiates Google OAuth flow
func GoogleOAuthLogin(c *gin.Context) {
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration error"})
		return
	}

	if cfg.GoogleOAuth.ClientID == "" || cfg.GoogleOAuth.ClientSecret == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Google OAuth not configured",
			"message": "Please configure Google OAuth credentials in config.yaml. See config.yaml.example for details.",
		})
		return
	}

	// Get redirect URL from query or use default
	redirectURL := c.Query("redirect_url")
	fmt.Println("redirectURL1: ", redirectURL)
	if redirectURL == "" {
		redirectURL = cfg.GoogleOAuth.RedirectURL
		fmt.Println("redirectURL2: ", redirectURL)
		if redirectURL == "" {
			redirectURL = "http://localhost:3000/auth/google/callback"
			fmt.Println("redirectURL3: ", redirectURL)
		}
	}
	// redirectURL = "http://localhost:3000"
	fmt.Println("redirectURL4: ", redirectURL)
	fmt.Println("cfg.GoogleOAuth.ClientID: ", cfg.GoogleOAuth.ClientID)
	fmt.Println("cfg.GoogleOAuth.ClientSecret: ", cfg.GoogleOAuth.ClientSecret)

	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleOAuth.ClientID,
		ClientSecret: cfg.GoogleOAuth.ClientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	// Generate state token for CSRF protection
	state := generateStateToken()
	// Set cookie for same-origin requests
	c.SetCookie("oauth_state", state, 600, "/", "", false, true)
	// Store the redirect_uri in a cookie so we can use the same one in callback
	c.SetCookie("oauth_redirect_uri", redirectURL, 600, "/", "", false, true)
	// Also return state in response so frontend can use it for cross-origin requests
	url := oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
	c.JSON(http.StatusOK, gin.H{
		"auth_url": url,
		"state":    state, // Return state so frontend can verify it
	})
}

// GoogleOAuthCallback handles Google OAuth callback
func GoogleOAuthCallback(c *gin.Context) {
	cfg, err := config.LoadConfig("config/config.yaml")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Configuration error"})
		return
	}

	// Verify state token - try cookie first (same-origin), then query param (cross-origin)
	stateFromQuery := c.Query("state")
	stateCookie, err := c.Cookie("oauth_state")

	// Verify state matches (either from cookie or we'll accept query param if cookie not available)
	// This allows cross-origin requests from frontend
	if stateFromQuery == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "State parameter required"})
		return
	}

	// If cookie exists, it must match. If not, we'll still proceed but log a warning
	if err == nil && stateCookie != stateFromQuery {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid state token"})
		return
	}

	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Authorization code not provided"})
		return
	}

	// Get the redirect_uri - MUST match the one used in initial OAuth request
	// Try query parameter first (for cross-origin API calls), then cookie, then config
	redirectURL := c.Query("redirect_uri")
	if redirectURL == "" {
		// Try cookie (for same-origin requests)
		redirectURICookie, err := c.Cookie("oauth_redirect_uri")
		if err == nil && redirectURICookie != "" {
			redirectURL = redirectURICookie
		}
	}
	if redirectURL == "" {
		// Fallback to config or default
		redirectURL = cfg.GoogleOAuth.RedirectURL
		if redirectURL == "" {
			redirectURL = "http://localhost:3000/auth/google/callback"
		}
	}

	oauthConfig := &oauth2.Config{
		ClientID:     cfg.GoogleOAuth.ClientID,
		ClientSecret: cfg.GoogleOAuth.ClientSecret,
		RedirectURL:  redirectURL,
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}

	// Exchange code for token
	token, err := oauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token: " + err.Error()})
		return
	}

	// Get user info from Google
	client := oauthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user info: " + err.Error()})
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read user info"})
		return
	}

	var googleUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}

	if err := json.Unmarshal(body, &googleUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse user info"})
		return
	}

	// Find or create user in database
	collection := database.Database.Collection("users")
	var user models.User

	// Try to find user by Google ID first
	err = collection.FindOne(c.Request.Context(), bson.M{"google_id": googleUser.ID}).Decode(&user)
	if err != nil && err != mongo.ErrNoDocuments {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	// If not found by Google ID, try by email
	if err == mongo.ErrNoDocuments {
		err = collection.FindOne(c.Request.Context(), bson.M{"email": googleUser.Email}).Decode(&user)
		if err != nil && err != mongo.ErrNoDocuments {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
			return
		}

		// If found by email, update with Google ID
		if err == nil {
			update := bson.M{
				"$set": bson.M{
					"google_id": googleUser.ID,
					"provider":  "google",
					"name":      googleUser.Name,
					"picture":   googleUser.Picture,
				},
			}
			collection.UpdateOne(c.Request.Context(), bson.M{"_id": user.ID}, update)
			user.GoogleID = googleUser.ID
			user.Provider = "google"
			user.Name = googleUser.Name
			user.Picture = googleUser.Picture
		}
	}

	// Create new user if doesn't exist
	if err == mongo.ErrNoDocuments {
		user = models.User{
			ID:       primitive.NewObjectID(),
			Email:    googleUser.Email,
			GoogleID: googleUser.ID,
			Provider: "google",
			Name:     googleUser.Name,
			Picture:  googleUser.Picture,
			Username: googleUser.Email, // Use email as username
		}

		_, err = collection.InsertOne(c.Request.Context(), user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
			return
		}
	}

	// Generate JWT token
	expirationTime := time.Now().Add(24 * time.Hour)
	jwtUsername := user.Username
	if jwtUsername == "" {
		jwtUsername = user.Email
	}
	claims := &Claims{
		Username: jwtUsername,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	jwtToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := jwtToken.SignedString([]byte(cfg.JWT.Secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	// Check if this is an API call (from frontend) or browser redirect
	// API calls typically have X-Requested-With header or Accept: application/json
	acceptHeader := c.GetHeader("Accept")
	xRequestedWith := c.GetHeader("X-Requested-With")
	isAPIRequest := xRequestedWith == "XMLHttpRequest" ||
		(acceptHeader != "" && (acceptHeader == "application/json" || acceptHeader == "*/*" ||
			(len(acceptHeader) >= 16 && acceptHeader[:16] == "application/json")))

	if isAPIRequest {
		// Clear the OAuth state and redirect_uri cookies
		c.SetCookie("oauth_state", "", -1, "/", "", false, true)
		c.SetCookie("oauth_redirect_uri", "", -1, "/", "", false, true)

		// Return JSON response for API calls from frontend
		response := models.LoginResponse{
			Token: tokenString,
			User: models.User{
				ID:       user.ID,
				Email:    user.Email,
				Username: user.Username,
				Provider: user.Provider,
				Name:     user.Name,
				Picture:  user.Picture,
			},
		}
		c.JSON(http.StatusOK, response)
	} else {
		// Redirect to frontend with token in URL query parameter (for direct browser redirects)
		frontendURL := "http://localhost:3000/auth/google/callback"

		// URL encode the values to handle special characters
		redirectURL = fmt.Sprintf("%s?token=%s&email=%s&name=%s",
			frontendURL,
			url.QueryEscape(tokenString),
			url.QueryEscape(user.Email),
			url.QueryEscape(user.Name))

		// Clear the OAuth state and redirect_uri cookies
		c.SetCookie("oauth_state", "", -1, "/", "", false, true)
		c.SetCookie("oauth_redirect_uri", "", -1, "/", "", false, true)

		c.Redirect(http.StatusTemporaryRedirect, redirectURL)
	}
}

// generateStateToken generates a simple state token for CSRF protection
func generateStateToken() string {
	return fmt.Sprintf("%d", time.Now().UnixNano())
}
