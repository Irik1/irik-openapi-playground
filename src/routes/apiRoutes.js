const path = require('path');
const { renderTemplate } = require('../utils/templateEngine');

/**
 * Setup API routes for the Express app
 * @param {Object} app - Express app instance
 * @param {Object} apiSpecs - Loaded API specifications
 */
const setupApiRoutes = (app, apiSpecs) => {
  // Landing page route
  app.get('/', (req, res) => {
    const templatePath = path.join(__dirname, '../../public/templates/landing.html');
    const data = {
      apis: Object.entries(apiSpecs).map(([key, api]) => ({
        key: key,
        title: api.title,
        version: api.version,
        description: api.description
      }))
    };
    res.send(renderTemplate(templatePath, data));
  });

  // Dynamic Swagger UI routes
  Object.keys(apiSpecs).forEach(apiKey => {
    app.get(`/api-docs/${apiKey}`, (req, res) => {
      const templatePath = path.join(__dirname, '../../public/templates/swagger-ui.html');
      const api = apiSpecs[apiKey];
      
      // Create navigation data for all APIs
      const navData = Object.keys(apiSpecs).map(key => ({
        key: key,
        title: apiSpecs[key].title,
        active: key === apiKey ? 'active' : ''
      }));
      
      const data = {
        title: `${api.title} Documentation`,
        apis: navData,
        spec: JSON.stringify(api.spec)
      };
      res.send(renderTemplate(templatePath, data));
    });
  });

  // Dynamic API endpoints to serve raw OpenAPI specs from S3
  Object.keys(apiSpecs).forEach(apiKey => {
    app.get(`/api/${apiKey}/openapi.yaml`, async (req, res) => {
      try {
        const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
        const YAML = require('yamljs');
        
        const s3Client = new S3Client({
          region: process.env.AWS_REGION || 'eu-west-1',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
        
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME || 'ewa-documentation',
          Key: apiSpecs[apiKey].s3Key,
        });
        
        const response = await s3Client.send(command);
        const yamlContent = await response.Body.transformToString();
        
        res.setHeader('Content-Type', 'application/x-yaml');
        res.send(yamlContent);
      } catch (error) {
        console.error(`Error serving ${apiKey} spec:`, error.message);
        res.status(500).json({ error: 'Failed to load API specification' });
      }
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      apis: Object.keys(apiSpecs),
      count: Object.keys(apiSpecs).length
    });
  });
};

module.exports = {
  setupApiRoutes
};
