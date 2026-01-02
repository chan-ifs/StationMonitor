import React, { useState, useEffect, use } from 'react';
import { ganttService } from '../services/api';
import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { getData } from "../demo/data";


// Task links array constant - following the structure from data.js
// Each link has: id, type ('s2s', 's2e', 'e2s', 'e2e'), source (task ID), target (task ID)
export const taskLink = [
  // End-to-Start dependencies (task must finish before next starts)
  // {
  //   id: 1,
  //   type: 'e2s', // end-to-start
  //   source: 2, // Requirements Gathering
  //   target: 3, // Design Phase
  // },
  // {
  //   id: 2,
  //   type: 'e2s',
  //   source: 3, // Design Phase
  //   target: 4, // Review & Approval
  // }
];

export const tasksArr = [
  {
    id: 1,
    text: 'Project Planning',
    start: new Date(2025, 11, 1, 8, 0), // December 1, 2025, 8:00 AM
    end: new Date(2025, 11, 8, 17, 0), // December 8, 2025, 5:00 PM
    type: 'summary',
    open: true,
    progress: 60,
  },
  // Child tasks under Project Planning
  {
    id: 2,
    text: 'Requirements Gathering',
    start: new Date(2025, 11, 1, 8, 0),
    end: new Date(2025, 11, 3, 17, 0),
    parent: 1,
    type: 'task',
    progress: 100,
  },
];

const toDate = v =>
  v instanceof Date ? v : v ? new Date(v) : null;

// Day style function for weekend styling (similar to data.js)
export const dayStyle = (a) => {
  const day = a.getDay() == 5 || a.getDay() == 6;
  return day ? 'sday' : '';
};

// Scales configuration for Gantt chart (similar to data.js)
export const taskScales = [
  { unit: 'month', step: 1, format: 'MMMM yyy' },
  { unit: 'day', step: 1, format: 'd', css: dayStyle },
];

// getData function matching the reference implementation pattern from data.js
export function getDataDemo(name) {
  name = name || 'default';
  const datasets = {
    default: { tasks: tasksArr, links: taskLink, scales: taskScales },
  };
  return datasets[name] || datasets.default;
}

// getGanttData function that fetches and returns data similar to useGanttTasks
// Returns a Promise that resolves to { tasks, links, scales }
export async function getGanttData(name) {
  name = name || 'default';

  try {
    const response = await ganttService.getTasks();

    // Ensure response exists and is an object
    if (!response || typeof response !== 'object') {
      console.warn('Invalid API response:', response);
      return {
        tasks: [],
        links: taskLink ?? [],
        scales: taskScales,
      };
    }

    const apiTasks = Array.isArray(response.tasks)
      ? response.tasks
      : [];

    const apiLinks = Array.isArray(response.links)
      ? response.links
      : [];
    console.log("apiTasks");
    console.log(apiTasks);
    // // Create ganttTasks array using a for loop to transform apiTasks into the necessary Gantt format
    // const ganttTasks = [];
    // for (let i = 0; i < apiTasks.length; i++) {
    //   console.log("I eeeeeee" + i);
    //   // const task = apiTasks[i];
    //   const ganttTask = {
    //     id: i+1,
    //     text: 'Project Planning',
    //     start: new Date(2025, 11, 1, 8, 0), // December 1, 2025, 8:00 AM
    //     end: new Date(2025, 11, 8, 17, 0), // December 8, 2025, 5:00 PM
    //     type: 'summary',
    //     open: true,
    //     progress: 60,
    //   };
    //   const ganttTask2 = {
    //     id: i + 11,
    //     text: 'Project Planning',
    //     start: new Date(2025, 11, 1, 8, 0), // December 1, 2025, 8:00 AM
    //     end: new Date(2025, 11, 8, 17, 0), // December 8, 2025, 5:00 PM
    //     parent: i + 1,
    //     type: 'task',
    //     open: true,
    //     progress: 60,
    //   };
    //   ganttTasks.push(ganttTask);
    //   ganttTasks.push(ganttTask2);
    // }
    // const ganttTasks = [];
    // console.log("ganttTasks");
    //  console.log(ganttTasks);
    //   for (let i = 0; i < apiTasks.length; i++) {
    //     const n = i + 1;
    //     const ganttTask = {
    //         id: i + 1,
    //             text: 'Project Planning',
    //             start: new Date(2025, 11, 1, 8, 0), // December 1, 2025, 8:00 AM
    //             end: new Date(2025, 11, 8, 17, 0), // December 8, 2025, 5:00 PM
    //             type: 'summary',
    //             open: false,
    //             progress: 60,
    //              };
    //       ganttTasks.push(ganttTask);
    //     const ganttTasks2 = {
    //         id: i + 10,
    //         text: 'Requirements Gathering',
    //         start: new Date(2025, 11, 1, 8, 0),
    //         end: new Date(2025, 11, 3, 17, 0),
    //         parent: i + 1,
    //         type: 'summary',
    //         // open: true,
    //               progress: 100,
    //       };
    //       ganttTasks.push(ganttTasks2);
    //     }


        // const ganttdata = getData();
        // const ganttTasks = ganttdata.tasks;

    //     const ganttTasks = [];
    // console.log("ganttTasks");
    //  console.log(ganttTasks);
    //   for (let i = 0; i < 3; i++) {
    //     const n = i + 1;
    //     const ganttTask = {
    //         id: i + 1,
    //             text: 'Project Planning',
    //             start: new Date(2025, 11, 1, 8, 0), // December 1, 2025, 8:00 AM
    //             end: new Date(2025, 11, 8, 17, 0), // December 8, 2025, 5:00 PM
    //             type: 'summary',
    //             open: true,
    //             progress: 60,
    //              };
    //       ganttTasks.push(ganttTask);
    //     const ganttTasks2 = {
    //         id: i + 10,
    //         text: 'Requirements Gathering',
    //         start: new Date(2025, 11, 1, 8, 0),
    //         end: new Date(2025, 11, 3, 17, 0),
    //         parent: i + 1,
    //         type: 'summary',
    //         progress: 100,
    //       };
    //       ganttTasks.push(ganttTasks2);
    //     }
    // console.log("ganttTasks2");
    // console.log(ganttTasks2);
    // // Transform tasks using the same logic as useGanttTasks
    const ganttTasks = apiTasks.map(task => {
      const taskObj = {
        ...task,
        id: task.id,
        text: task.id + " - " + task.type + " - " + task.text,
        type: task.type,
        progress: task.progress,
        duration: task.duration,
        start: toDate(task.start),
        end: toDate(task.end),
      };

      // Only include parent if it exists and is not null/undefined
      if (task.parent !== null && task.parent !== undefined) {
        taskObj.parent = task.parent;
      }

      // Include open property if available
      if (task.open !== null && task.open !== undefined) {
        taskObj.open = task.open;
      }
      // taskObj.open = false;
      console.log(taskObj);
      return taskObj;
    });

    const datasets = {
      default: {
        tasks: ganttTasks ?? [],
        links: apiLinks.length > 0 ? apiLinks : (taskLink ?? []),
        scales: taskScales,
      },
    };

    return datasets[name] || datasets.default;
  } catch (error) {
    console.error('Error fetching gantt data:', error);
    // Return default structure with empty tasks on error
    return {
      tasks: [],
      links: taskLink ?? [],
      scales: taskScales,
    };
  }
}

export const useGanttTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await ganttService.getTasks();
        // Ensure response exists and is an object
        if (!response || typeof response !== 'object') {
          console.warn('Invalid API response:', response);
          setTasks([]);
          setLinks([]);
          setLoading(false);
          return;
        }

        const apiTasks = Array.isArray(response.tasks)
          ? response.tasks
          : [];

        const apiLinks = Array.isArray(response.links)
          ? response.links
          : [];


        const ganttTasks = apiTasks.map(task => {
          const taskObj = {
            // ...task,
            id: task.id,
            text: task.id + " - " + task.type + " - " + task.text,
            type: task.type,
            progress: task.progress,
            duration: task.duration,
            start: toDate(task.start),
            end: toDate(task.end),
          };

          // Only include parent if it exists and is not null/undefined
          if (task.parent !== null && task.parent !== undefined) {
            taskObj.parent = task.parent;
          }

          // Include open property if available
          if (task.open !== null && task.open !== undefined) {
            taskObj.open = task.open;
          }

          return taskObj;
        });

        // // Sort tasks: parent tasks (summary) first, then child tasks
        // // This ensures parent tasks are processed before their children
        // const sortedTasks = ganttTasks.sort((a, b) => {
        //   // If both have parents or both don't, maintain order
        //   if ((a.parent == null) === (b.parent == null)) {
        //     // If both are summary or both are tasks, maintain order
        //     if (a.type === b.type) return 0;
        //     // Summary tasks come before regular tasks
        //     return a.type === 'summary' ? -1 : 1;
        //   }
        //   // Tasks without parents (summary) come first
        //   return a.parent == null ? -1 : 1;
        // });

        setTasks(ganttTasks ?? []);
        setLinks(taskLink ?? []);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []); // 👈 runs once

  return { tasks, links, loading, error };
};

const TasksInfo = () => {
  const [tasks, setTasks] = useState([]);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ganttService.getTasks();

      // // Transform dates from strings to Date objects if needed
      // const transformedTasks = response.tasks.map(task => ({
      //   ...task,
      //   // start: task.start instanceof Date ? task.start : new Date(task.start),
      //   // end: task.end instanceof Date ? task.end : new Date(task.end),
      //   id: 1,
      //   text: 'Task 1',
      //   type: 'task',
      //   parent: null,
      //   progress: 50,
      //   start: new Date(Date.now()),
      //   end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      // }));

      // setTasks(transformedTasks);
      // setLinks([]);
      // // setLinks(response.links || []);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString();
  };

  // Calculate duration in hours
  const calculateDuration = (start, end) => {
    if (!start || !end) return 'N/A';
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
    const hours = Math.round((endDate - startDate) / (1000 * 60 * 60));
    return `${hours} hours`;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading aircraft work package tasks...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          <Typography variant="h6">Error Loading Tasks</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Aircraft Work Package Tasks
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          Total Tasks: {tasks.length} | Total Links: {links.length}
        </Typography>
      </Box>

      {tasks.length === 0 ? (
        <Alert severity="info">
          No tasks found. Ensure work packages have scheduled dates set.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>ID</strong></TableCell>
                <TableCell><strong>Task Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Parent</strong></TableCell>
                <TableCell><strong>Start Date</strong></TableCell>
                <TableCell><strong>End Date</strong></TableCell>
                <TableCell><strong>Duration</strong></TableCell>
                <TableCell><strong>Progress</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>{task.id}</TableCell>
                  <TableCell>{task.text}</TableCell>
                  <TableCell>{task.type || 'task'}</TableCell>
                  <TableCell>{task.parent || '-'}</TableCell>
                  <TableCell>{formatDate(task.start)}</TableCell>
                  <TableCell>{formatDate(task.end)}</TableCell>
                  <TableCell>
                    {task.duration ? `${task.duration} hours` : calculateDuration(task.start, task.end)}
                  </TableCell>
                  <TableCell>
                    {task.progress !== undefined ? `${task.progress}%` : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {links.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            Task Dependencies (Links)
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Source Task</strong></TableCell>
                  <TableCell><strong>Target Task</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id || `${link.source}-${link.target}`}>
                    <TableCell>{link.id || '-'}</TableCell>
                    <TableCell>{link.type}</TableCell>
                    <TableCell>{link.source}</TableCell>
                    <TableCell>{link.target}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

// Export the tasks array getter function for use in other components
export const getTasksArray = async () => {
  try {
    const response = await ganttService.getTasks();
    // Transform dates from strings to Date objects if needed
    const tasksArray = response.tasks.map(task => ({
      ...task,
      start: task.start instanceof Date ? task.start : new Date(task.start),
      end: task.end instanceof Date ? task.end : new Date(task.end),
    }));
    return tasksArray;
  } catch (error) {
    console.error('Error fetching tasks array:', error);
    throw error;
  }
};

export default TasksInfo;
