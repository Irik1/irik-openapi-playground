# API Documentation Hub

A simple web application that displays API documentation from various folders using SwaggerUI. This application serves as a centralized hub for exploring and interacting with multiple OpenAPI specifications.

## Features

- 🚀 **Modern Landing Page**: Beautiful, responsive landing page with API cards
- 📊 **Multiple API Support**: Displays documentation for Sync API and Words API
- 🔍 **Interactive Documentation**: Full Swagger UI integration for testing APIs
- 🎨 **Custom Styling**: Clean, modern UI with hover effects and animations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- ⚡ **Health Monitoring**: Built-in health check endpoint

## Quick Start

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm start
```

3. Open your browser and navigate to:
   - **Main Hub**: http://localhost:3000
   - **Sync API Docs**: http://localhost:3000/api-docs/sync
   - **Words API Docs**: http://localhost:3000/api-docs/words
   - **Health Check**: http://localhost:3000/health

### Development Mode

For development with auto-restart:
```bash
npm run dev
```

## API Endpoints

### Documentation Routes
- `GET /` - Landing page with API overview
- `GET /api-docs/sync` - Sync API documentation (Swagger UI)
- `GET /api-docs/words` - Words API documentation (Swagger UI)

### Raw API Specs
- `GET /api/sync/openapi.yaml` - Raw Sync API OpenAPI spec
- `GET /api/words/openapi.yaml` - Raw Words API OpenAPI spec

### Utility Routes
- `GET /health` - Health check endpoint

## Project Structure

```
irik-openapi-playground/
├── data/                     # API specifications directory
│   ├── context-translation/
│   │   └── openapi.yaml      # Context Translation API spec
│   ├── sync/
│   │   └── openapi.yaml      # Sync API specification
│   └── words/
│       └── openapi.yaml      # Words API specification
├── src/                      # Source code modules
│   ├── config/
│   │   └── server.js         # Server configuration and startup
│   ├── routes/
│   │   ├── apiRoutes.js      # API documentation routes
│   │   ├── errorRoutes.js    # Error handling routes
│   │   └── index.js          # Routes index
│   └── utils/
│       ├── apiLoader.js      # API specification loader
│       ├── templateEngine.js # Template rendering engine
│       └── index.js          # Utils index
├── public/
│   ├── css/
│   │   ├── landing.css       # Landing page styles
│   │   └── swagger-ui.css    # Swagger UI custom styles
│   └── templates/
│       ├── landing.html      # Landing page template
│       └── swagger-ui.html   # Swagger UI page template
├── server.js                 # Main entry point
├── package.json              # Dependencies and scripts
└── README.md                 # This file
```

## Adding New APIs

To add a new API to the documentation hub:

1. Create a new folder in the `data/` directory (e.g., `data/new-api/`)
2. Add your `openapi.yaml` file to that folder
3. **That's it!** The system will automatically:
   - Discover the new API folder
   - Load the OpenAPI specification
   - Create documentation routes (`/api-docs/new-api`)
   - Create raw spec endpoints (`/api/new-api/openapi.yaml`)
   - Add it to the landing page
   - Include it in the navigation panel

The system is now fully dynamic and will work with any number of APIs without code changes!

## Architecture

The application follows a modular architecture for better maintainability and organization:

### **Core Modules:**

- **`server.js`** - Main entry point that orchestrates all modules
- **`src/config/server.js`** - Express app configuration and server startup
- **`src/routes/apiRoutes.js`** - All API documentation routes
- **`src/routes/errorRoutes.js`** - Error handling middleware
- **`src/utils/apiLoader.js`** - Dynamic API specification loading
- **`src/utils/templateEngine.js`** - Template rendering with loops and variables

### **Benefits of Modular Architecture:**

- **Separation of Concerns** - Each module has a single responsibility
- **Maintainability** - Easy to locate and modify specific functionality
- **Testability** - Individual modules can be tested in isolation
- **Scalability** - Easy to add new features without affecting existing code
- **Code Reusability** - Modules can be reused across different parts of the application

## Technologies Used

- **Express.js** - Web framework for Node.js
- **Swagger UI Express** - Swagger UI integration
- **YAML.js** - YAML file parsing
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Development auto-restart (dev dependency)

## License

MIT
Playground of trying to create openapi flexible landing for ewa project
