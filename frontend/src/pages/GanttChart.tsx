import React, { useMemo, useState, Component, ErrorInfo, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Gantt } from '@svar-ui/react-gantt';
import '@svar-ui/react-gantt/style.css';
// import { sampleTasks, sampleLinks } from '../demo/data';
import { tasksArr, taskLink } from './TasksInfo';
import { useGanttTasks } from './TasksInfo';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GanttErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Gantt Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="h6">Error rendering Gantt chart</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {this.state.error?.message || 'An unknown error occurred'}
          </Typography>
          <Button
            variant="outlined"
            sx={{ mt: 2 }}
            onClick={() => {
              this.setState({ hasError: false, error: null });
              window.location.reload();
            }}
          >
            Reload Page
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Custom styles for scale rows with red background and grid lines
// Based on SVAR Gantt structure: scale rows are rendered in order
const scaleStyles = `
  .wx-gantt-scale-row {
    border-bottom: 1px solid #cc0000 !important;
  }
  .wx-gantt-scale-row:first-child {
    background-color: #ffcccc !important;
  }
  .wx-gantt-scale-row:nth-child(2) {
    background-color: #ff9999 !important;
  }
  .wx-gantt-scale-row:nth-child(3) {
    background-color: #ff6666 !important;
  }
  /* Grid lines for scale cells - vertical and horizontal */
  .wx-gantt-scale-cell {
    border-right: 1px solid #cc0000 !important;
    border-bottom: 1px solid #cc0000 !important;
    border-left: none !important;
    border-top: none !important;
  }
  /* Ensure first cell in each row doesn't have left border */
  .wx-gantt-scale-cell:first-child {
    border-left: 1px solid #cc0000 !important;
  }
  /* Ensure last cell in each row has right border */
  .wx-gantt-scale-cell:last-child {
    border-right: 1px solid #cc0000 !important;
  }
  .wx-gantt-scale {
    border: 1px solid #cc0000 !important;
  }
  /* Ensure cells inherit row background */
  .wx-gantt-scale-row:first-child .wx-gantt-scale-cell {
    background-color: #ffcccc !important;
  }
  .wx-gantt-scale-row:nth-child(2) .wx-gantt-scale-cell {
    background-color: #ff9999 !important;
  }
  .wx-gantt-scale-row:nth-child(3) .wx-gantt-scale-cell {
    background-color: #ff6666 !important;
  }
  /* Alternative selectors in case class names differ */
  [class*="scale-cell"] {
    border-right: 1px solid #cc0000 !important;
    border-bottom: 1px solid #cc0000 !important;
  }
  [class*="scale-row"] {
    border-bottom: 1px solid #cc0000 !important;
  }
  /* Grid lines for task area - vertical time lines */
  .wx-gantt-task-cell,
  .wx-gantt-row-cell,
  .wx-gantt-grid-cell,
  .wx-gantt-data-cell {
    border-right: 1px solid #cc0000 !important;
    border-bottom: 1px solid #cc0000 !important;
  }
  /* Ensure first cell in each row doesn't have left border */
  .wx-gantt-task-cell:first-child,
  .wx-gantt-row-cell:first-child,
  .wx-gantt-grid-cell:first-child,
  .wx-gantt-data-cell:first-child {
    border-left: 1px solid #cc0000 !important;
  }
  /* Ensure last cell in each row has right border */
  .wx-gantt-task-cell:last-child,
  .wx-gantt-row-cell:last-child,
  .wx-gantt-grid-cell:last-child,
  .wx-gantt-data-cell:last-child {
    border-right: 1px solid #cc0000 !important;
  }
  /* Task rows - horizontal lines between tasks */
  .wx-gantt-task-row,
  .wx-gantt-row,
  .wx-gantt-data-row {
    border-bottom: 1px solid #cc0000 !important;
  }
  /* Alternative selectors for task area grid lines */
  [class*="task-cell"],
  [class*="row-cell"],
  [class*="grid-cell"],
  [class*="data-cell"] {
    border-right: 1px solid #cc0000 !important;
    border-bottom: 1px solid #cc0000 !important;
  }
  [class*="task-row"],
  [class*="data-row"] {
    border-bottom: 1px solid #cc0000 !important;
  }
`;

const GanttChart: React.FC = () => {
  const navigate = useNavigate();
  
  // Fetch tasks from server using custom hook from TasksInfo
  // const { tasks, links, loading } = useGanttTasks();
  // const { tasks, links, loading } = { tasks: tasksArr, links: taskLink, loading: false };
  const { tasks, links, loading } = useGanttTasks();


  // Configure timeline scales
  // The css function applies styles per cell based on date
  // Row-level backgrounds are handled by global CSS above
  const scales = useMemo(() => {
    // Return a clean array with validated scale objects
    return [
      { 
        unit: 'month' as const, 
        step: 1, 
        format: 'MMMM yyyy'
      },
      { 
        unit: 'day' as const, 
        step: 1, 
        format: 'dd MMM'
      },
      { 
        unit: 'hour' as const, 
        step: 1, 
        format: 'HH:mm'
      },
    ];
  }, []);

  // Set timeline date range starting from December 1st, 2024
  const [startDate] = useState<Date>(() => {
    const date = new Date(2024, 11, 1); // December 1, 2024 (month is 0-indexed, so 11 = December)
    date.setHours(0, 0, 0, 0); // Start of day
    return date;
  });
  const [endDate] = useState<Date>(() => {
    const date = new Date(2025, 11, 31); // December 31, 2025
    date.setHours(23, 59, 59, 999); // End of day
    return date;
  });

  // Memoize safe arrays to prevent unnecessary re-renders
  const safeTasks = useMemo(() => {
    return Array.isArray(tasks) ? tasks : [];
  }, [tasks]);

  const safeLinks = useMemo(() => {
    return Array.isArray(links) ? links : [];
  }, [links]);

  // Debug logging
  useEffect(() => {
    if (!loading) {
      console.log('Gantt data ready:', {
        tasksCount: safeTasks.length,
        linksCount: safeLinks.length,
        tasksIsArray: Array.isArray(tasks),
        linksIsArray: Array.isArray(links),
        tasksType: typeof tasks,
        linksType: typeof links,
      });
    }
  }, [loading, safeTasks, safeLinks, tasks, links]);

  return (
    <Container maxWidth={false} sx={{ mt: 2, mb: 4, px: 2 }}>
        <style>{scaleStyles}</style>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            Back to Dashboard
          </Button>
          <Typography variant="h4" component="h1">
            Gantt Chart Timeline
          </Typography>
        </Box>
        <Box
          sx={{
            height: 'calc(100vh - 200px)',
            width: '100%',
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            overflow: 'hidden',
            backgroundColor: '#fff',
          }}
        >
          {loading ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Loading tasks...
            </Alert>
          ) : !Array.isArray(scales) || scales.length === 0 || !startDate || !endDate ? (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Invalid Gantt chart configuration. Scales: {Array.isArray(scales) ? scales.length : 'null'}
            </Alert>
          ) : !startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime()) ? (
            <Alert severity="error" sx={{ mt: 2 }}>Invalid date range</Alert>
          ) : (
            <GanttErrorBoundary>
              {(() => {
                // Validate scales array

                const validScales = scales.filter(scale => 
                  scale && 
                  scale.unit && 
                  typeof scale.step === 'number' && 
                  scale.format
                );

                if (validScales.length === 0) {
                  return <Alert severity="error">Invalid scales configuration</Alert>;
                }
                
                // Use memoized safe arrays
                // Deep validation - check each task for null properties
                const validatedTasks = safeTasks.map((task: any, index: number) => {
                  if (!task || typeof task !== 'object') {
                    console.error(`Task at index ${index} is invalid:`, task);
                    return null;
                  }
                  
                  // Check for null values in task properties
                  const cleanedTask: any = { ...task };
                  Object.keys(cleanedTask).forEach((key: string) => {
                    if (cleanedTask[key] === null) {
                      console.warn(`Task ${task.id} has null property: ${key}`);
                      // Remove null properties that might cause issues
                      delete cleanedTask[key];
                    }
                  });
                  return cleanedTask;
                }).filter((task: any) => task !== null);
                
                // Log for debugging
                console.log('Gantt props:', {
                  tasksLength: validatedTasks.length,
                  linksLength: safeLinks.length,
                  scalesLength: validScales.length,
                  start: startDate,
                  end: endDate,
                  tasksType: Array.isArray(validatedTasks) ? 'array' : typeof validatedTasks,
                  linksType: Array.isArray(safeLinks) ? 'array' : typeof safeLinks,
                  firstTask: validatedTasks.length > 0 ? validatedTasks[0] : null,
                });
                
                // Final validation - ensure no null values
                if (!Array.isArray(validatedTasks) || !Array.isArray(safeLinks)) {
                  console.error('Invalid data types:', { validatedTasks, safeLinks });
                  return (
                    <Alert severity="error">
                      Invalid data format. Tasks and links must be arrays.
                    </Alert>
                  );
                }

                const ganttProps: any = {
                  tasks: validatedTasks,
                  links: safeLinks,
                  scales: validScales,
                  start: startDate,
                  end: endDate,
                };
                try {
                  return <Gantt key={`gantt-${validatedTasks.length}-${safeLinks.length}`} {...ganttProps} />;
                } catch (renderError) {
                  console.error('Error rendering Gantt component:', renderError);
                  return (
                    <Alert severity="error">
                      Failed to render Gantt chart. Check console for details.
                    </Alert>
                  );
                }
              })()}
            </GanttErrorBoundary>
          )}
        </Box>
      </Container>
  );
};

export default GanttChart;

