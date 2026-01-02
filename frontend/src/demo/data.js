// Sample Gantt chart data for demo purposes
// This file contains sample tasks and links that can be used for testing the Gantt chart component

export const sampleTasks = [
  // Parent task - Project Planning
  // Parent task - Project Planning
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
  // {
  //   id: 3,
  //   text: 'Design Phase',
  //   start: new Date(2025, 11, 4, 8, 0),
  //   end: new Date(2025, 11, 6, 17, 0),
  //   parent: 1,
  //   type: 'task',
  //   progress: 80,
  // },
  // {
  //   id: 4,
  //   text: 'Review & Approval',
  //   start: new Date(2025, 11, 7, 8, 0),
  //   end: new Date(2025, 11, 8, 17, 0),
  //   parent: 1,
  //   type: 'task',
  //   progress: 30,
  // },
  
  // // Parent task - Development
  // {
  //   id: 5,
  //   text: 'Development Phase',
  //   start: new Date(2025, 11, 9, 8, 0), // December 9, 2025
  //   end: new Date(2025, 11, 20, 17, 0), // December 20, 2025
  //   type: 'summary',
  //   open: true,
  //   progress: 45,
  // },
  // // Child tasks under Development
  // {
  //   id: 6,
  //   text: 'Backend Development',
  //   start: new Date(2025, 11, 9, 8, 0),
  //   end: new Date(2025, 11, 13, 17, 0),
  //   parent: 5,
  //   type: 'task',
  //   progress: 70,
  // },
  // {
  //   id: 7,
  //   text: 'Frontend Development',
  //   start: new Date(2025, 11, 10, 8, 0),
  //   end: new Date(2025, 11, 15, 17, 0),
  //   parent: 5,
  //   type: 'task',
  //   progress: 50,
  // },
  // {
  //   id: 8,
  //   text: 'Integration',
  //   start: new Date(2025, 11, 16, 8, 0),
  //   end: new Date(2025, 11, 18, 17, 0),
  //   parent: 5,
  //   type: 'task',
  //   progress: 20,
  // },
  // {
  //   id: 9,
  //   text: 'Testing',
  //   start: new Date(2025, 11, 19, 8, 0),
  //   end: new Date(2025, 11, 20, 17, 0),
  //   parent: 5,
  //   type: 'task',
  //   progress: 10,
  // },
  
  // // Milestone
  // {
  //   id: 10,
  //   text: 'Alpha Release',
  //   start: new Date(2025, 11, 21, 12, 0), // December 21, 2025, noon
  //   end: new Date(2025, 11, 21, 12, 0),
  //   type: 'milestone',
  //   progress: 0,
  // },
  
  // // Standalone task
  // {
  //   id: 11,
  //   text: 'Documentation',
  //   start: new Date(2025, 11, 15, 8, 0),
  //   end: new Date(2025, 11, 22, 17, 0),
  //   type: 'task',
  //   progress: 25,
  // },
  
  // // Another parent task - Quality Assurance
  // {
  //   id: 12,
  //   text: 'Quality Assurance',
  //   start: new Date(2025, 11, 22, 8, 0), // December 22, 2025
  //   end: new Date(2025, 11, 31, 17, 0), // December 31, 2025
  //   type: 'summary',
  //   open: true,
  //   progress: 15,
  // },
  // {
  //   id: 13,
  //   text: 'Unit Testing',
  //   start: new Date(2025, 11, 22, 8, 0),
  //   end: new Date(2025, 11, 25, 17, 0),
  //   parent: 12,
  //   type: 'task',
  //   progress: 40,
  // },
  // {
  //   id: 14,
  //   text: 'Integration Testing',
  //   start: new Date(2025, 11, 26, 8, 0),
  //   end: new Date(2025, 11, 28, 17, 0),
  //   parent: 12,
  //   type: 'task',
  //   progress: 10,
  // },
  // {
  //   id: 15,
  //   text: 'User Acceptance Testing',
  //   start: new Date(2025, 11, 29, 8, 0),
  //   end: new Date(2025, 11, 31, 17, 0),
  //   parent: 12,
  //   type: 'task',
  //   progress: 0,
  // },
];
// Sample tasks with hierarchical structure
export const sampleTasks2 = [
  // Parent task - Project Planning
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
  {
    id: 3,
    text: 'Design Phase',
    start: new Date(2025, 11, 4, 8, 0),
    end: new Date(2025, 11, 6, 17, 0),
    parent: 1,
    type: 'task',
    progress: 80,
  },
  {
    id: 4,
    text: 'Review & Approval',
    start: new Date(2025, 11, 7, 8, 0),
    end: new Date(2025, 11, 8, 17, 0),
    parent: 1,
    type: 'task',
    progress: 30,
  },
  
  // Parent task - Development
  {
    id: 5,
    text: 'Development Phase',
    start: new Date(2025, 11, 9, 8, 0), // December 9, 2025
    end: new Date(2025, 11, 20, 17, 0), // December 20, 2025
    type: 'summary',
    open: true,
    progress: 45,
  },
  // Child tasks under Development
  {
    id: 6,
    text: 'Backend Development',
    start: new Date(2025, 11, 9, 8, 0),
    end: new Date(2025, 11, 13, 17, 0),
    parent: 5,
    type: 'task',
    progress: 70,
  },
  {
    id: 7,
    text: 'Frontend Development',
    start: new Date(2025, 11, 10, 8, 0),
    end: new Date(2025, 11, 15, 17, 0),
    parent: 5,
    type: 'task',
    progress: 50,
  },
  {
    id: 8,
    text: 'Integration',
    start: new Date(2025, 11, 16, 8, 0),
    end: new Date(2025, 11, 18, 17, 0),
    parent: 5,
    type: 'task',
    progress: 20,
  },
  {
    id: 9,
    text: 'Testing',
    start: new Date(2025, 11, 19, 8, 0),
    end: new Date(2025, 11, 20, 17, 0),
    parent: 5,
    type: 'task',
    progress: 10,
  },
  
  // Milestone
  {
    id: 10,
    text: 'Alpha Release',
    start: new Date(2025, 11, 21, 12, 0), // December 21, 2025, noon
    end: new Date(2025, 11, 21, 12, 0),
    type: 'milestone',
    progress: 0,
  },
  
  // Standalone task
  {
    id: 11,
    text: 'Documentation',
    start: new Date(2025, 11, 15, 8, 0),
    end: new Date(2025, 11, 22, 17, 0),
    type: 'task',
    progress: 25,
  },
  
  // Another parent task - Quality Assurance
  {
    id: 12,
    text: 'Quality Assurance',
    start: new Date(2025, 11, 22, 8, 0), // December 22, 2025
    end: new Date(2025, 11, 31, 17, 0), // December 31, 2025
    type: 'summary',
    open: true,
    progress: 15,
  },
  {
    id: 13,
    text: 'Unit Testing',
    start: new Date(2025, 11, 22, 8, 0),
    end: new Date(2025, 11, 25, 17, 0),
    parent: 12,
    type: 'task',
    progress: 40,
  },
  {
    id: 14,
    text: 'Integration Testing',
    start: new Date(2025, 11, 26, 8, 0),
    end: new Date(2025, 11, 28, 17, 0),
    parent: 12,
    type: 'task',
    progress: 10,
  },
  {
    id: 15,
    text: 'User Acceptance Testing',
    start: new Date(2025, 11, 29, 8, 0),
    end: new Date(2025, 11, 31, 17, 0),
    parent: 12,
    type: 'task',
    progress: 0,
  },
];

export const sampleLinks = [];
// Sample links representing dependencies between tasks
export const sampleLinks2 = [
  // End-to-Start dependencies (task must finish before next starts)
  {
    id: 1,
    type: 'e2s', // end-to-start
    source: 2, // Requirements Gathering
    target: 3, // Design Phase
  },
  {
    id: 2,
    type: 'e2s',
    source: 3, // Design Phase
    target: 4, // Review & Approval
  },
  {
    id: 3,
    type: 'e2s',
    source: 4, // Review & Approval
    target: 6, // Backend Development
  },
  {
    id: 4,
    type: 'e2s',
    source: 4, // Review & Approval
    target: 7, // Frontend Development
  },
  {
    id: 5,
    type: 'e2s',
    source: 6, // Backend Development
    target: 8, // Integration
  },
  {
    id: 6,
    type: 'e2s',
    source: 7, // Frontend Development
    target: 8, // Integration
  },
  {
    id: 7,
    type: 'e2s',
    source: 8, // Integration
    target: 9, // Testing
  },
  {
    id: 8,
    type: 'e2s',
    source: 9, // Testing
    target: 10, // Alpha Release milestone
  },
  {
    id: 9,
    type: 'e2s',
    source: 10, // Alpha Release
    target: 13, // Unit Testing
  },
  {
    id: 10,
    type: 'e2s',
    source: 13, // Unit Testing
    target: 14, // Integration Testing
  },
  {
    id: 11,
    type: 'e2s',
    source: 14, // Integration Testing
    target: 15, // User Acceptance Testing
  },
  // Start-to-Start dependency (tasks start together)
  {
    id: 12,
    type: 's2s', // start-to-start
    source: 6, // Backend Development
    target: 7, // Frontend Development (can start in parallel)
  },
];

export const dayStyle = (a) => {
  const day = a.getDay() == 5 || a.getDay() == 6;
  return day ? 'sday' : '';
};

export const sampleScales = [
  { unit: 'month', step: 1, format: 'MMMM yyy' },
  { unit: 'day', step: 1, format: 'd', css: dayStyle },
];

// Combined data object matching GanttDataResponse structure
export const sampleGanttData = {
  tasks: sampleTasks,
  links: sampleLinks,
  scales: sampleScales,
};

// getData function matching the reference implementation pattern
export function getData(name) {
  name = name || 'default';
 const datasets = {
    default: { tasks: sampleTasks, links: sampleLinks, scales: sampleScales },
  };
  return datasets[name] || datasets.default;
}

// Export default for convenience
export default sampleGanttData;

