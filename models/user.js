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
      allowNull: false
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
);

module.exports = User