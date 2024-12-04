const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Event = require('./event');

const ChatRoom = sequelize.define('ChatRoom', {
    eventId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Event,
            key: 'id'
        }
    }
});

module.exports = ChatRoom;