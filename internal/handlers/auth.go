package handlers

import (
	"net/http"
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

