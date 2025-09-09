/**
 * Setup error handling routes for the Express app
 * @param {Object} app - Express app instance
 */
const setupErrorRoutes = (app) => {
  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ 
      error: 'Not Found',
      message: 'The requested resource was not found on this server.'
    });
  });

  // Error handler
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Something went wrong!'
    });
  });
};

module.exports = {
  setupErrorRoutes
};
