const YAML = require('yamljs');
const swaggerDocument = YAML.load('./config/swagger/swagger.yaml');

module.exports = swaggerDocument;