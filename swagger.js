// swagger.js
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const path = require('path');

// Load the swagger specification from YAML file
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Optional: Add customization options
const options = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Notes & Todos API Documentation',
  swaggerOptions: {
    persistAuthorization: true, // Keep authorization token between refreshes
  },
};

module.exports = { swaggerDocument, swaggerUi, options };