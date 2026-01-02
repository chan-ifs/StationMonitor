package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email    string             `bson:"email" json:"email"`
	Username string             `bson:"username,omitempty" json:"username,omitempty"`
	Password string             `bson:"password" json:"-"` // Don't expose password in JSON
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"` // Can be username or email
	Password string `json:"password" binding:"required"`
}

type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type RegisterResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
	Message string `json:"message"`
}

