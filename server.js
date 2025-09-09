// Main server entry point
const { loadApiSpecs } = require('./src/utils');
const { createApp, startServer } = require('./src/config/server');
const { setupApiRoutes, setupErrorRoutes } = require('./src/routes');

// Load API specifications
const apiSpecs = loadApiSpecs();

// Create and configure Express app
const { app, PORT } = createApp();

// Setup routes
setupApiRoutes(app, apiSpecs);
setupErrorRoutes(app);

// Start the server
startServer(app, PORT, apiSpecs);