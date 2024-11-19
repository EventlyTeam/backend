const { Sequelize } = require('sequelize');

const DB_USERNAME = process.env.DATABASE_USERNAME || 'postgres'

const sequelize = new Sequelize(process.env.DB_NAME, DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres'
});

module.exports = sequelize;