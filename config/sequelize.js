const { Sequelize } = require('sequelize');

const DATABASE_URL = process.env.DATABASE_URL;

const sequelize = DATABASE_URL ? new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
}) : new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
  host: 'localhost',
  dialect: 'postgres'
});;

module.exports = sequelize;