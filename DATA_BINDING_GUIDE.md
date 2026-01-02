# Gantt Chart Data Binding Guide

This guide explains how to bind data to the SVAR Gantt chart component.

## Frontend Implementation

### 1. Task Data Structure

Each task must have the following required properties:

```typescript
interface GanttTask {
  id: string | number;        // Unique identifier
  text: string;                // Task name/description
  start: Date;                 // Start date (must be Date object)
  end: Date;                   // End date (must be Date object)
  duration?: number;           // Duration in days (optional, calculated if not provided)
  progress?: number;           // Progress percentage (0-100)
  type?: 'task' | 'summary' | 'milestone';
  parent?: string | number;    // Parent task ID for hierarchical tasks
  open?: boolean;              // Whether parent task is expanded
  [key: string]: any;          // Additional custom properties
}
```

### 2. Link Data Structure (Optional)

Links represent dependencies between tasks:

```typescript
interface GanttLink {
  id?: string | number;
  type: 's2s' | 's2e' | 'e2s' | 'e2e';  // Dependency type
  source: string | number;     // Source task ID
  target: string | number;     // Target task ID
}
```

**Link Types:**
- `s2s`: Start-to-Start (target starts when source starts)
- `s2e`: Start-to-End (target ends when source starts)
- `e2s`: End-to-Start (target starts when source ends)
- `e2e`: End-to-End (target ends when source ends)

### 3. Example Task Data

```typescript
const tasks = [
  {
    id: 1,
    text: "Project Planning",
    start: new Date(2024, 0, 1),  // January 1, 2024
    end: new Date(2024, 0, 15),   // January 15, 2024
    duration: 14,
    progress: 100,
    type: "task"
  },
  {
    id: 2,
    text: "Development Phase",
    start: new Date(2024, 0, 16),
    end: new Date(2024, 2, 15),   // March 15, 2024
    duration: 59,
    progress: 50,
    type: "summary",
    open: true
  },
  {
    id: 3,
    text: "Sprint 1",
    start: new Date(2024, 0, 16),
    end: new Date(2024, 1, 5),    // February 5, 2024
    parent: 2,
    type: "task",
    progress: 75
  }
];

const links = [
  {
    id: 1,
    type: "e2s",  // End-to-Start
    source: 1,    // Project Planning
    target: 2     // Development Phase
  }
];
```

## Backend API Implementation

### 1. Create Backend Endpoint

Add this to your Go backend (`internal/routes/routes.go`):

```go
// In SetupRoutes function, add:
protected.GET("/gantt/tasks", handlers.GetGanttTasks)
```

### 2. Create Handler (`internal/handlers/gantt.go`)

```go
package handlers

import (
    "net/http"
    "time"
    
    "stationMonitor/internal/database"
    "stationMonitor/internal/models"
    
    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/mongo"
)

type GanttTask struct {
    ID       interface{} `json:"id" bson:"_id"`
    Text     string      `json:"text" bson:"text"`
    Start    time.Time   `json:"start" bson:"start"`
    End      time.Time   `json:"end" bson:"end"`
    Duration *int        `json:"duration,omitempty" bson:"duration,omitempty"`
    Progress *int        `json:"progress,omitempty" bson:"progress,omitempty"`
    Type     string      `json:"type,omitempty" bson:"type,omitempty"`
    Parent   interface{} `json:"parent,omitempty" bson:"parent,omitempty"`
    Open     *bool       `json:"open,omitempty" bson:"open,omitempty"`
}

type GanttLink struct {
    ID     interface{} `json:"id,omitempty" bson:"_id,omitempty"`
    Type   string      `json:"type" bson:"type"`
    Source interface{} `json:"source" bson:"source"`
    Target interface{} `json:"target" bson:"target"`
}

type GanttDataResponse struct {
    Tasks []GanttTask `json:"tasks"`
    Links []GanttLink `json:"links,omitempty"`
}

func GetGanttTasks(c *gin.Context) {
    collection := database.Database.Collection("tasks")
    
    ctx := c.Request.Context()
    cursor, err := collection.Find(ctx, bson.M{})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch tasks"})
        return
    }
    defer cursor.Close(ctx)
    
    var tasks []GanttTask
    if err := cursor.All(ctx, &tasks); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode tasks"})
        return
    }
    
    // Fetch links if needed
    linksCollection := database.Database.Collection("taskLinks")
    var links []GanttLink
    linksCursor, err := linksCollection.Find(ctx, bson.M{})
    if err == nil {
        defer linksCursor.Close(ctx)
        linksCursor.All(ctx, &links)
    }
    
    response := GanttDataResponse{
        Tasks: tasks,
        Links: links,
    }
    
    c.JSON(http.StatusOK, response)
}
```

### 3. MongoDB Collection Structure

Create a `tasks` collection in MongoDB with documents like:

```json
{
  "_id": 1,
  "text": "Project Planning",
  "start": ISODate("2024-01-01T00:00:00Z"),
  "end": ISODate("2024-01-15T00:00:00Z"),
  "duration": 14,
  "progress": 100,
  "type": "task"
}
```

## Data Flow

1. **Component Mounts**: `useEffect` hook triggers
2. **API Call**: `ganttService.getTasks()` fetches data from `/api/gantt/tasks`
3. **Data Transformation**: String dates are converted to Date objects
4. **State Update**: Tasks and links are set in component state
5. **Render**: Gantt component receives data and displays timeline

## Important Notes

- **Date Objects**: Always convert date strings to Date objects before passing to Gantt
- **Unique IDs**: Each task must have a unique `id`
- **Hierarchical Tasks**: Use `parent` property to create task hierarchies
- **Summary Tasks**: Set `type: "summary"` for parent tasks that group children
- **Timeline Range**: Ensure `start` and `end` dates cover your task date range

## Testing with Sample Data

You can test without a backend by using sample data:

```typescript
const sampleTasks = [
  {
    id: 1,
    text: "Sample Task 1",
    start: new Date(),
    end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    progress: 50,
    type: "task"
  }
];
```

Set this directly in state for testing:
```typescript
useEffect(() => {
  setTasks(sampleTasks);
  setLoading(false);
}, []);
```






