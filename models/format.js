const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const Format = sequelize.define('Format', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false,
    }
});

module.exports = Format;