const YAML = require('yamljs');
const path = require('path');
const fs = require('fs');

/**
 * Dynamically load all OpenAPI specifications from data directory
 * @returns {Object} Object containing loaded API specifications
 */
const loadApiSpecs = () => {
  const dataDir = path.join(__dirname, '../../data');
  const apiSpecs = {};
  
  try {
    const folders = fs.readdirSync(dataDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    folders.forEach(folder => {
      const specPath = path.join(dataDir, folder, 'openapi.yaml');
      if (fs.existsSync(specPath)) {
        try {
          const spec = YAML.load(specPath);
          apiSpecs[folder] = {
            spec: spec,
            title: spec.info?.title || folder,
            version: spec.info?.version || '1.0.0',
            description: spec.info?.description || `API documentation for ${folder}`
          };
          console.log(`✅ Loaded API: ${folder} (${apiSpecs[folder].title} v${apiSpecs[folder].version})`);
        } catch (error) {
          console.error(`❌ Error loading ${folder}:`, error.message);
        }
      }
    });
  } catch (error) {
    console.error('❌ Error reading data directory:', error.message);
  }
  
  return apiSpecs;
};

module.exports = {
  loadApiSpecs
};
