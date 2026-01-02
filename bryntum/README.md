# Station Monitor - React Frontend

A React TypeScript frontend application for the Station Monitor system.

## Features

- User authentication (Login/Register)
- Protected routes
- Dashboard with navigation
- Material-UI components
- TypeScript support

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (optional):
```
REACT_APP_API_URL=http://localhost:8080
```

3. Start the development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
bryntum/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── PrivateRoute.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   └── Dashboard.tsx
│   ├── services/
│   │   └── api.ts
│   ├── App.tsx
│   ├── index.tsx
│   └── index.css
├── package.json
└── tsconfig.json
```

## API Configuration

The API base URL can be configured via the `REACT_APP_API_URL` environment variable. Default is `http://localhost:8080`.

## License

Copyright © 2024 Station Monitor. All rights reserved.

