# Demo Data Configuration

This folder contains configuration for the Bryntum Gantt component.

## Files

- **config.json** - Configuration file to determine data source
- **ganttConfig.ts** - Gantt component configuration

## Configuration

Edit `config.json` to switch between demo and actual API data:

```json
{
  "useDemoData": true,    // Set to true to use demo data, false to use API
  "demoDataFile": "demodata.json"  // Name of the demo data file
}
```

### Using Demo Data

Set `useDemoData: true` to load data from `demodata.json`. This is useful for:
- Development and testing
- Demonstrations
- Offline development

The demo data file should be located at `public/data/demodata.json`.

### Using API Data

Set `useDemoData: false` to load data from the API endpoint (`/api/gantt/tasks`). The system will:
- Fetch data from the backend API
- Transform it to Bryntum format
- Fall back to demo data if the API call fails

## Data Format

The `demodata.json` file should contain Bryntum Gantt data in the following format:

```json
{
  "project": { ... },
  "calendars": { ... },
  "tasks": {
    "rows": [ ... ]
  },
  "dependencies": {
    "rows": [ ... ]
  }
}
```

