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
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GanttTask represents a task in the Gantt chart format
type GanttTask struct {
	ID       interface{} `json:"id"`
	Text     string      `json:"text"`
	Start    time.Time   `json:"start"`
	End      time.Time   `json:"end"`
	Duration *int        `json:"duration,omitempty"`
	Progress *int        `json:"progress,omitempty"`
	Type     string      `json:"type,omitempty"`
	Parent   interface{} `json:"parent,omitempty"`
	Open     *bool       `json:"open,omitempty"`
}

// GanttLink represents a link between tasks in the Gantt chart
type GanttLink struct {
	ID     interface{} `json:"id,omitempty"`
	Type   string      `json:"type"` // 's2s', 's2e', 'e2s', 'e2e'
	Source interface{} `json:"source"`
	Target interface{} `json:"target"`
}

// GanttDataResponse represents the response structure for Gantt chart data
type GanttDataResponse struct {
	Tasks []GanttTask `json:"tasks"`
	Links []GanttLink `json:"links,omitempty"`
}

// GetGanttTasks retrieves aircraft work packages and transforms them into Gantt chart format
func GetGanttTasks(c *gin.Context) {
	// Verify database connection
	if database.Database == nil {
		log.Printf("Error: Database connection is nil")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not established"})
		return
	}

	collection := database.Database.Collection("AvAircraftWorkPackage")
	log.Printf("Querying collection: aircraftWorkPackages")

	// Query parameters for filtering
	filter := bson.M{}

	// Filter by AircraftWorkPackageId = 1061
	filter["AircraftWorkPackageId"] = 547
	log.Printf("Filtering by AircraftWorkPackageId: 1227")

	// Filter by AircraftId if provided
	if aircraftIdStr := c.Query("aircraftId"); aircraftIdStr != "" {
		if aircraftId, err := strconv.Atoi(aircraftIdStr); err == nil {
			filter["AircraftId"] = aircraftId
			log.Printf("Filtering by AircraftId: %d", aircraftId)
		}
	}

	// Filter by AircraftWorkPackageId if provided
	if wpIdStr := c.Query("aircraftWorkPackageId"); wpIdStr != "" {
		if wpId, err := strconv.Atoi(wpIdStr); err == nil {
			filter["AircraftWorkPackageId"] = wpId
			log.Printf("Filtering by AircraftWorkPackageId: %d", wpId)
		}
	}

	// Filter by LocationCode if provided
	if locationCode := c.Query("locationCode"); locationCode != "" {
		filter["LocationCode"] = locationCode
		log.Printf("Filtering by LocationCode: %s", locationCode)
	}

	// Filter by IsHistoric if provided
	if isHistoricStr := c.Query("isHistoric"); isHistoricStr != "" {
		if isHistoric, err := strconv.ParseBool(isHistoricStr); err == nil {
			filter["IsHistoric"] = isHistoric
			log.Printf("Filtering by IsHistoric: %v", isHistoric)
		}
	}

	// // Get date range filters
	// startDateStr := c.Query("startDate")
	// endDateStr := c.Query("endDate")

	// if startDateStr != "" || endDateStr != "" {
	// 	dateFilter := bson.M{}
	// 	if startDateStr != "" {
	// 		if startDate, err := time.Parse(time.RFC3339, startDateStr); err == nil {
	// 			dateFilter["$gte"] = startDate
	// 		}
	// 	}
	// 	if endDateStr != "" {
	// 		if endDate, err := time.Parse(time.RFC3339, endDateStr); err == nil {
	// 			dateFilter["$lte"] = endDate
	// 		}
	// 	}
	// 	if len(dateFilter) > 0 {
	// 		filter["SchedStartDateTime"] = dateFilter
	// 	}
	// }

	// Check total count in collection for debugging
	totalCount, err := collection.CountDocuments(c.Request.Context(), bson.M{})
	if err != nil {
		log.Printf("Warning: Could not count documents: %v", err)
	} else {
		log.Printf("Total documents in aircraftWorkPackages collection: %d", totalCount)
	}

	// Check count with current filter
	filteredCount, err := collection.CountDocuments(c.Request.Context(), filter)
	if err != nil {
		log.Printf("Warning: Could not count filtered documents: %v", err)
	} else {
		log.Printf("Documents matching filter: %d", filteredCount)
	}

	// Find options - limit to reasonable number and sort by start date
	findOptions := options.Find()
	findOptions.SetLimit(1000) // Limit to prevent overwhelming the frontend
	findOptions.SetSort(bson.D{{Key: "SchedStartDateTime", Value: 1}})

	// Execute query
	cursor, err := collection.Find(c.Request.Context(), filter, findOptions)
	if err != nil {
		log.Printf("Error querying database: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query database: " + err.Error()})
		return
	}
	defer cursor.Close(c.Request.Context())

	var workPackages []models.AircraftWorkPackage
	if err := cursor.All(c.Request.Context(), &workPackages); err != nil {
		log.Printf("Error decoding work packages: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode results: " + err.Error()})
		return
	}

	log.Printf("Found %d work packages from database", len(workPackages))

	// Transform work packages to Gantt tasks
	// Only using the important fields: taskseq, workpackageid, aircraft id, descriptions,
	// SchedStartDateTime, SchedEndDateTime, PlannedStart, PlannedFinish, Duration,
	// ActualStart, ActualFinish, EarliestStart, LatestStart, LatestFinish,
	// FixedStart (as boolean), ExcludeFromScheduling, AdjustedDuration
	tasks := []GanttTask{}
	links := []GanttLink{}
	taskIDCounter := 1
	skippedCount := 0

	for _, wp := range workPackages {
		// Prepare work package task
		wpTask, wpTaskID, skipped := PrepareWorkPackageGanttTask(wp, &taskIDCounter)
		if skipped {
			skippedCount++
			continue
		}
		tasks = append(tasks, wpTask)

		// Process nested tasks (avexetask)
		if len(wp.Avexetask) == 0 {
			continue
		}

		for _, task := range wp.Avexetask {
			// Prepare AvExeTask
			childTask, taskID, skipped := PrepareAvExeTaskGanttTask(task, wpTaskID, &taskIDCounter)
			if skipped {
				continue
			}
			tasks = append(tasks, childTask)

			// Process execution instances
			log.Printf("task.JtExecutionInstanceArray: %+v\n", task.JtExecutionInstanceArray)
			if len(task.JtExecutionInstanceArray) == 0 {
				continue
			}

			for _, instance := range task.JtExecutionInstanceArray {
				// Prepare execution instance
				instanceTask, _, skipped := PrepareExecutionInstanceGanttTask(instance, taskID, &taskIDCounter)
				if skipped {
					continue
				}
				tasks = append(tasks, instanceTask)
			}
		}
	}

	// Create links between consecutive work packages (optional)
	// This creates end-to-start links between work packages
	for i := 0; i < len(tasks)-1; i++ {
		if tasks[i].Type == "summary" {
			// Find next summary task
			for j := i + 1; j < len(tasks); j++ {
				if tasks[j].Type == "summary" {
					link := GanttLink{
						ID:     taskIDCounter,
						Type:   "e2s", // end-to-start
						Source: tasks[i].ID,
						Target: tasks[j].ID,
					}
					links = append(links, link)
					taskIDCounter++
					break
				}
			}
		}
	}

	log.Printf("Transformed %d work packages into %d Gantt tasks (skipped %d)",
		len(workPackages), len(tasks), skippedCount)

	response := GanttDataResponse{
		Tasks: tasks,
		Links: links,
	}

	// If no tasks found, return a helpful message
	if len(tasks) == 0 {
		log.Printf("No tasks to return. Total work packages: %d, Skipped: %d",
			len(workPackages), skippedCount)
		// Still return empty arrays so frontend doesn't error
		c.JSON(http.StatusOK, gin.H{
			"tasks":   []GanttTask{},
			"links":   []GanttLink{},
			"message": "No tasks found. Ensure work packages have SchedStartDateTime and SchedEndDateTime set.",
			"debug": gin.H{
				"totalWorkPackages": len(workPackages),
				"skipped":           skippedCount,
			},
		})
		return
	}

	c.JSON(http.StatusOK, response)
}
