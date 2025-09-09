const fs = require('fs');

/**
 * Enhanced template rendering function
 * @param {string} templatePath - Path to the template file
 * @param {Object} data - Data object to render in template
 * @returns {string} Rendered HTML
 */
const renderTemplate = (templatePath, data) => {
  const template = fs.readFileSync(templatePath, 'utf8');
  
  // Handle simple variable replacement
  let result = template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || '';
  });
  
  // Handle array iteration for APIs
  result = result.replace(/\{\{#apis\}\}([\s\S]*?)\{\{\/apis\}\}/g, (match, content) => {
    if (!data.apis || !Array.isArray(data.apis)) return '';
    
    return data.apis.map(api => {
      return content
        .replace(/\{\{api\.key\}\}/g, api.key)
        .replace(/\{\{api\.title\}\}/g, api.title)
        .replace(/\{\{api\.version\}\}/g, api.version)
        .replace(/\{\{api\.description\}\}/g, api.description)
        .replace(/\{\{api\.active\}\}/g, api.active || '');
    }).join('');
  });
  
  return result;
};

module.exports = {
  renderTemplate
};
