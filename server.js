// Main server entry point
require('dotenv').config();
const { loadApiSpecs } = require('./src/utils');
const { createApp, startServer } = require('./src/config/server');
const { setupApiRoutes, setupErrorRoutes } = require('./src/routes');

// Initialize the application
const initializeApp = async () => {
  try {
    console.log('🔄 Loading API specifications from S3...');
    
    // Load API specifications from S3
    const apiSpecs = await loadApiSpecs();
    
    // Create and configure Express app
    const { app, PORT } = createApp();
    
    // Setup routes
    setupApiRoutes(app, apiSpecs);
    setupErrorRoutes(app);
    
    // Start the server
    startServer(app, PORT, apiSpecs);
  } catch (error) {
    console.error('❌ Failed to initialize application:', error.message);
    process.exit(1);
  }
};

// Start the application
initializeApp();