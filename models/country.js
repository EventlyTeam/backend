const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Country = sequelize.define('Country', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
});

module.exports = Country;