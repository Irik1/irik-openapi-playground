const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * Create and configure Express application
 * @returns {Object} Configured Express app
 */
const createApp = () => {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.static('public'));

  return { app, PORT };
};

/**
 * Start the server
 * @param {Object} app - Express app instance
 * @param {number} port - Port number
 * @param {Object} apiSpecs - Loaded API specifications
 */
const startServer = (app, port, apiSpecs) => {
  app.listen(port, () => {
    console.log(`🚀 API Documentation Hub running on http://localhost:${port}`);
    
    // Log available API documentation routes
    Object.keys(apiSpecs).forEach(apiKey => {
      console.log(`📊 ${apiSpecs[apiKey].title} docs: http://localhost:${port}/api-docs/${apiKey}`);
    });
    
    console.log(`🔍 Health check: http://localhost:${port}/health`);
  });
};

module.exports = {
  createApp,
  startServer
};
