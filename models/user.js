const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize')

const User = sequelize.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  },
);

module.exports = User