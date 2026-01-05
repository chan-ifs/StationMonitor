package routes

import (
	"stationMonitor/internal/handlers"
	"stationMonitor/internal/middleware"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/mongo"
)

func SetupRoutes(router *gin.Engine, db *mongo.Database) {
	// CORS middleware
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Public routes
	api := router.Group("/api")
	{
		api.POST("/login", handlers.Login)
		api.POST("/register", handlers.Register)
		api.GET("/auth/google", handlers.GoogleOAuthLogin)
		api.GET("/auth/google/callback", handlers.GoogleOAuthCallback)
	}

	// Protected routes
	protected := api.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		protected.GET("/dashboard", handlers.Dashboard)
		
		// Gantt Chart routes
		protected.GET("/gantt/tasks", handlers.GetGanttTasks)
		
		// Aircraft Work Package routes
		protected.GET("/aircraft-work-packages", handlers.GetAircraftWorkPackages)
		protected.GET("/aircraft-work-packages/:id", handlers.GetAircraftWorkPackageByID)
		protected.GET("/aircraft/:aircraftId/work-packages", handlers.GetAircraftWorkPackagesByAircraftId)
	}
}

