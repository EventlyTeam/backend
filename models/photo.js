const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Event = require('./event')

const Photo = sequelize.define('Photo', {
    uri: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    }
});

Event.hasMany(Photo, { foreignKey: 'eventId', as: 'photos' });
Photo.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = Photo;