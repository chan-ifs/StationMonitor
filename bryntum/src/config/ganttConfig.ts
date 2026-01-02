export const ganttConfig = {
  columns: [
    { type: 'name', field: 'name', width: 250 },
    { type: 'startdate', field: 'startDate', width: 120 },
    { type: 'duration', field: 'duration', width: 100 },
    { type: 'percentdone', field: 'percentDone', width: 100 },
  ],
  viewPreset: 'monthAndYear',
  features: {
    taskEdit: true,
    taskResize: true,
    taskDrag: true,
    dependencies: true,
    cellEdit: true,
  },
  tbar: {
    type: 'gantttoolbar'
  } as any,
};

