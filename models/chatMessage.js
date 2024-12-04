const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');
const ChatRoom = require('./chatRoom');

const ChatMessage = sequelize.define('ChatMessage', {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    chatRoomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ChatRoom,
            key: 'id'
        }
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

ChatMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' })
User.hasMany(ChatMessage, { foreignKey: 'userId' })

module.exports = ChatMessage;