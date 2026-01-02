package main

import (
	"context"
	"fmt"
	"os"
	"time"

	"golang.org/x/crypto/bcrypt"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func main() {
	// Get MongoDB URL from environment or use default
	mongoURL := os.Getenv("MONGODB_URL")
	if mongoURL == "" {
		fmt.Println("Please set MONGODB_URL environment variable")
		fmt.Println("Example: export MONGODB_URL='mongodb+srv://user:pass@cluster.mongodb.net/'")
		os.Exit(1)
	}

	// Get username and password from command line or use defaults
	username := "admin"
	password := "password123"

	if len(os.Args) > 1 {
		username = os.Args[1]
	}
	if len(os.Args) > 2 {
		password = os.Args[2]
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Printf("Error hashing password: %v\n", err)
		os.Exit(1)
	}

	// Connect to MongoDB
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
	if err != nil {
		fmt.Printf("Error connecting to MongoDB: %v\n", err)
		os.Exit(1)
	}
	defer client.Disconnect(ctx)

	// Ping database
	if err := client.Ping(ctx, nil); err != nil {
		fmt.Printf("Error pinging MongoDB: %v\n", err)
		os.Exit(1)
	}

	// Get database and collection
	db := client.Database("stationMonitor")
	collection := db.Collection("users")

	// Check if user already exists
	var existingUser bson.M
	err = collection.FindOne(ctx, bson.M{"username": username}).Decode(&existingUser)
	if err == nil {
		fmt.Printf("User '%s' already exists. Updating password...\n", username)
		// Update existing user
		_, err = collection.UpdateOne(
			ctx,
			bson.M{"username": username},
			bson.M{"$set": bson.M{"password": string(hashedPassword)}},
		)
		if err != nil {
			fmt.Printf("Error updating user: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("User '%s' password updated successfully!\n", username)
	} else if err == mongo.ErrNoDocuments {
		// Create new user
		_, err = collection.InsertOne(ctx, bson.M{
			"username": username,
			"password": string(hashedPassword),
		})
		if err != nil {
			fmt.Printf("Error creating user: %v\n", err)
			os.Exit(1)
		}
		fmt.Printf("User '%s' created successfully!\n", username)
	} else {
		fmt.Printf("Error checking user: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\nLogin credentials:\n")
	fmt.Printf("Username: %s\n", username)
	fmt.Printf("Password: %s\n", password)
}

