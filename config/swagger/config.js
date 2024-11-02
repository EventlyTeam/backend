const YAML = require('yamljs');
const swaggerDocument = YAML.load('./config/swagger/openapi.yaml');

module.exports = swaggerDocument;