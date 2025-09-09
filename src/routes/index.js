// Routes index file
const { setupApiRoutes } = require('./apiRoutes');
const { setupErrorRoutes } = require('./errorRoutes');

module.exports = {
  setupApiRoutes,
  setupErrorRoutes
};
