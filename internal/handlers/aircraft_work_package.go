package handlers

import (
	"log"
	"net/http"
	"strconv"
	"time"

	"stationMonitor/internal/database"
	"stationMonitor/internal/models"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetAircraftWorkPackages retrieves all aircraft work packages from MongoDB
func GetAircraftWorkPackages(c *gin.Context) {
	collection := database.Database.Collection("aircraftWorkPackages")

	// Parse query parameters for filtering
	filter := bson.M{}

	// Filter by AircraftId if provided
	if aircraftIdStr := c.Query("aircraftId"); aircraftIdStr != "" {
		if aircraftId, err := strconv.Atoi(aircraftIdStr); err == nil {
			filter["AircraftId"] = aircraftId
		}
	}

	// Filter by AircraftWorkPackageId if provided
	if wpIdStr := c.Query("aircraftWorkPackageId"); wpIdStr != "" {
		if wpId, err := strconv.Atoi(wpIdStr); err == nil {
			filter["AircraftWorkPackageId"] = wpId
		}
	}

	// Filter by LocationCode if provided
	if locationCode := c.Query("locationCode"); locationCode != "" {
		filter["LocationCode"] = locationCode
	}

	// Filter by IsHistoric if provided
	if isHistoricStr := c.Query("isHistoric"); isHistoricStr != "" {
		if isHistoric, err := strconv.ParseBool(isHistoricStr); err == nil {
			filter["IsHistoric"] = isHistoric
		}
	}

	// Pagination parameters
	page := 1
	limit := 100
	if pageStr := c.Query("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 1000 {
			limit = l
		}
	}

	skip := (page - 1) * limit

	// Find options
	findOptions := options.Find()
	findOptions.SetSkip(int64(skip))
	findOptions.SetLimit(int64(limit))
	findOptions.SetSort(bson.D{{Key: "SchedStartDateTime", Value: -1}}) // Sort by scheduled start date descending

	// Execute query
	cursor, err := collection.Find(c.Request.Context(), filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database: " + err.Error()})
		return
	}
	defer cursor.Close(c.Request.Context())

	var workPackages []models.AircraftWorkPackage
	if err := cursor.All(c.Request.Context(), &workPackages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results: " + err.Error()})
		return
	}

	// Get total count for pagination
	totalCount, err := collection.CountDocuments(c.Request.Context(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to count documents: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":       workPackages,
		"total":      totalCount,
		"page":       page,
		"limit":      limit,
		"totalPages": (int(totalCount) + limit - 1) / limit,
	})
}

// GetAircraftWorkPackageByID retrieves a specific aircraft work package by ID
func GetAircraftWorkPackageByID(c *gin.Context) {
	collection := database.Database.Collection("aircraftWorkPackages")

	id := c.Param("id")

	// Try to parse as ObjectID first
	var filter bson.M
	if objectID, err := primitive.ObjectIDFromHex(id); err == nil {
		filter = bson.M{"_id": objectID}
	} else {
		// If not ObjectID, try as AircraftWorkPackageId (integer)
		if wpId, err := strconv.Atoi(id); err == nil {
			filter = bson.M{"AircraftWorkPackageId": wpId}
		} else {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
			return
		}
	}

	var workPackage models.AircraftWorkPackage
	err := collection.FindOne(c.Request.Context(), filter).Decode(&workPackage)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Aircraft work package not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, workPackage)
}

// GetAircraftWorkPackagesByAircraftId retrieves all work packages for a specific aircraft
func GetAircraftWorkPackagesByAircraftId(c *gin.Context) {
	collection := database.Database.Collection("aircraftWorkPackages")

	aircraftIdStr := c.Param("aircraftId")
	aircraftId, err := strconv.Atoi(aircraftIdStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid aircraft ID"})
		return
	}

	filter := bson.M{"AircraftId": aircraftId}

	// Find options - sort by scheduled start date
	findOptions := options.Find()
	findOptions.SetSort(bson.D{{Key: "SchedStartDateTime", Value: -1}})

	cursor, err := collection.Find(c.Request.Context(), filter, findOptions)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database: " + err.Error()})
		return
	}
	defer cursor.Close(c.Request.Context())

	var workPackages []models.AircraftWorkPackage
	if err := cursor.All(c.Request.Context(), &workPackages); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  workPackages,
		"count": len(workPackages),
	})
}

// PrepareWorkPackageGanttTask prepares a Gantt task from an aircraft work package
// Returns the task, task ID, and a boolean indicating if the work package should be skipped
// taskIDCounter is incremented internally
func PrepareWorkPackageGanttTask(wp models.AircraftWorkPackage, taskIDCounter *int) (GanttTask, int, bool) {
	// Only include work packages with valid scheduled dates
	if wp.SchedStartDateTime == nil || wp.SchedEndDateTime == nil {
		log.Printf("Skipping work package %d: missing scheduled dates (Start: %v, End: %v)",
			wp.AircraftWorkPackageId, wp.SchedStartDateTime, wp.SchedEndDateTime)
		return GanttTask{}, 0, true
	}

	taskID := *taskIDCounter
	*taskIDCounter++

	// Calculate duration in hours from scheduled dates
	duration := int(wp.SchedEndDateTime.Sub(*wp.SchedStartDateTime).Hours())

	// Determine if task should be open based on whether it has nested tasks
	var open bool
	if len(wp.Avexetask) == 0 {
		open = false
	} else {
		open = true
		log.Printf("wp.AircraftWorkPackageId: %+v\n", wp.AircraftWorkPackageId)
	}

	progress := 0

	// Build task text with work package details
	taskText := wp.WorkPackageName
	if wp.WoNumber != "" {
		taskText += " (" + wp.WoNumber + ")"
	}
	taskText += " [WP:" + strconv.Itoa(wp.AircraftWorkPackageId) + ", AC:" + strconv.Itoa(wp.AircraftId) + "]"

	wpTask := GanttTask{
		ID:       taskID,
		Text:     taskText,
		Start:    *wp.SchedStartDateTime,
		End:      *wp.SchedEndDateTime,
		Duration: &duration,
		Progress: &progress,
		Type:     "summary",
		Open:     &open,
	}

	log.Printf("wpTask: %+v\n", wp)
	return wpTask, taskID, false
}

// PrepareAvExeTaskGanttTask prepares a Gantt task from an AvExeTask
// Returns the task, task ID, and a boolean indicating if the task should be skipped
// taskIDCounter is incremented internally
func PrepareAvExeTaskGanttTask(task models.AvExeTask, wpTaskID int, taskIDCounter *int) (GanttTask, int, bool) {
	// Determine start and end dates using priority: PlannedStart/PlannedFinish, then EarliestStart/LatestFinish
	var taskStart *time.Time
	var taskEnd *time.Time

	// Use PlannedStart/PlannedFinish if available, otherwise EarliestStart/LatestFinish
	if task.PlannedStart != nil {
		taskStart = task.PlannedStart
	} else if task.EarliestStart != nil {
		taskStart = task.EarliestStart
	}

	if task.PlannedFinish != nil {
		taskEnd = task.PlannedFinish
	} else if task.LatestFinish != nil {
		taskEnd = task.LatestFinish
	}
	log.Printf("taskStart: %+v, taskEnd: %+v", taskStart, taskEnd)

	// Skip if no valid dates found
	if taskStart == nil || taskEnd == nil {
		return GanttTask{}, 0, true
	}

	taskID := *taskIDCounter
	*taskIDCounter++

	// Use Duration if available, otherwise calculate from dates
	taskDuration := 0
	if task.Duration != nil {
		taskDuration = *task.Duration
	} else {
		// Calculate from dates in hours
		taskDuration = int(taskEnd.Sub(*taskStart).Hours())
	}

	// Calculate progress using ActualStart/ActualFinish if available
	taskProgress := 0
	if task.ActualStart != nil && task.ActualFinish != nil {
		actualDuration := task.ActualFinish.Sub(*task.ActualStart).Hours()
		scheduledDuration := taskEnd.Sub(*taskStart).Hours()
		if scheduledDuration > 0 {
			taskProgress = int((actualDuration / scheduledDuration) * 100)
			if taskProgress > 100 {
				taskProgress = 100
			}
		}
	} else if task.ActualStart != nil {
		elapsed := time.Since(*task.ActualStart).Hours()
		scheduledDuration := taskEnd.Sub(*taskStart).Hours()
		if scheduledDuration > 0 {
			taskProgress = int((elapsed / scheduledDuration) * 100)
			if taskProgress > 100 {
				taskProgress = 100
			}
		}
	}

	// Build task text with description, taskseq, workpackageid, and aircraft id
	taskText := "WT: " + task.Description
	if taskText == "" {
		taskText = "Task"
	}
	// Add task sequence number, work package id, and aircraft id for identification
	taskText = "[Seq:" + strconv.Itoa(task.TaskSeq) + ", WP:" + strconv.Itoa(task.AircraftWpId) + ", AC:" + strconv.Itoa(task.AircraftId) + "] " + taskText

	childTask := GanttTask{
		ID:       taskID,
		Text:     taskText,
		Start:    *taskStart,
		End:      *taskEnd,
		Duration: &taskDuration,
		Progress: &taskProgress,
		Type:     "task",
		Parent:   wpTaskID,
	}

	return childTask, taskID, false
}

// PrepareExecutionInstanceGanttTask prepares a Gantt task from a JtExecutionInstance
// Returns the task, task ID, and a boolean indicating if the instance should be skipped
// taskIDCounter is incremented internally
func PrepareExecutionInstanceGanttTask(instance models.JtExecutionInstance, parentTaskID int, taskIDCounter *int) (GanttTask, int, bool) {
	log.Printf("instance: %+v\n", instance)

	// Use instance.AllocatedStart and instance.AllocatedFinish for start and end
	instanceStart := instance.AllocatedStart
	instanceEnd := instance.AllocatedFinish

	// Skip if no valid start/end
	if instanceStart == nil || instanceEnd == nil {
		return GanttTask{}, 0, true
	}

	taskID := *taskIDCounter
	*taskIDCounter++

	var instanceDuration *int
	dur := int(instanceEnd.Sub(*instanceStart).Hours())
	instanceDuration = &dur

	// Create default text for the instance task
	instanceText := "ExecInstance:" + strconv.Itoa(instance.ExecutionInstanceSeq) + "] ExecInstance"

	// Set progress
	p := 0
	instanceProgress := &p

	instanceTask := GanttTask{
		ID:       taskID,
		Text:     instanceText,
		Start:    *instanceStart,
		End:      *instanceEnd,
		Duration: instanceDuration,
		Progress: instanceProgress,
		Type:     "task",
		Parent:   parentTaskID, // AvExeTask is the parent
	}

	return instanceTask, taskID, false
}
