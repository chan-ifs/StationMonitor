# Quick Start Guide

## Prerequisites Setup

1. **MongoDB Atlas Setup:**
   - Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
   - Create a new cluster (free tier is fine)
   - Get your connection string
   - Create a database named `stationMonitor`
   - Create a collection named `users`

2. **Create Configuration:**
   ```bash
   cp config/config.yaml.example config/config.yaml
   ```
   Edit `config/config.yaml` and add your MongoDB connection string.

3. **Create Test User:**
   
   **Option A: Using MongoDB Compass/Atlas UI**
   - Insert this document into the `users` collection:
   ```json
   {
     "username": "admin",
     "password": "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
   }
   ```
   This password hash corresponds to: `password123`

   **Option B: Using the Setup Script**
   ```bash
   export MONGODB_URL="your-mongodb-connection-string"
   go run scripts/setup-user.go admin password123
   ```

## Running with Docker

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8080
```

## Default Login Credentials

- **Username:** `admin`
- **Password:** `password123`

**Note:** Change these credentials in production!

## Troubleshooting

- **Backend won't start:** Check MongoDB connection string in `config/config.yaml`
- **Can't login:** Ensure user exists in MongoDB with bcrypt hashed password
- **Frontend can't connect:** Check that backend is running and CORS is enabled

