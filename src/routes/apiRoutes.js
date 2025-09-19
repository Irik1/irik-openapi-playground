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
    
    // Group APIs by folder
    const apisByFolder = {};
    Object.entries(apiSpecs).forEach(([key, api]) => {
      let folder = api.folder || 'default';
      
      // If folder is empty, try to extract from API key (e.g., "crm-crm" -> "crm")
      if (!folder || folder === '') {
        const parts = key.split('-');
        if (parts.length >= 2) {
          folder = parts[0];
        } else {
          folder = 'default';
        }
      }
      
      if (!apisByFolder[folder]) {
        apisByFolder[folder] = [];
      }
      apisByFolder[folder].push({
        key: key,
        title: api.title,
        version: api.version,
        description: api.description,
        fileName: api.fileName
      });
    });
    
    // Generate API HTML with folder name in description
    let apiHtml = '';
    Object.entries(apisByFolder).forEach(([folderName, apis]) => {
      apis.forEach(api => {
        const folderTag = `<span class="folder-tag">${folderName}</span>`;
        const enhancedDescription = `${folderTag} ${api.description}`;
        
        apiHtml += `
          <a href="/api-docs/${api.key}" class="api-brick" data-version="${api.version}" data-title="${api.title}" data-description="${api.description}" data-folder="${folderName}">
            <div class="brick-header">
              <div class="api-title">${api.title}</div>
              <div class="api-version">v${api.version}</div>
            </div>
            <div class="api-description">
              ${enhancedDescription}
            </div>
            <div class="brick-footer">
              <span class="view-docs">View Documentation →</span>
            </div>
          </a>
        `;
      });
    });

    const data = {
      apiHtml: apiHtml,
      apis: Object.entries(apiSpecs).map(([key, api]) => ({
        key: key,
        title: api.title,
        version: api.version,
        description: api.description
      }))
    };
    
    res.send(renderTemplate(templatePath, data));
  });

  // Dynamic API documentation routes
  Object.keys(apiSpecs).forEach(apiKey => {
    app.get(`/api-docs/${apiKey}`, (req, res) => {
      const templatePath = path.join(__dirname, '../../public/templates/api-docs.html');
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
