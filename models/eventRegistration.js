const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user');
const Event = require('./event');

const EventRegistration = sequelize.define('EventRegistration', { 
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
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

User.belongsToMany(Event, {
    through: EventRegistration,
    foreignKey: 'userId',
    otherKey: 'eventId',
    as: 'registeredEvents'
});

Event.belongsToMany(User, {
    through: EventRegistration,
    foreignKey: 'eventId',
    otherKey: 'userId',
    as: 'participants'
});

EventRegistration.belongsTo(User, { foreignKey: 'userId' });
EventRegistration.belongsTo(Event, { foreignKey: 'eventId' });

EventRegistration.afterCreate(async (registration, options) => {
    const { eventId } = registration;

    await Event.increment('participantAmount',
        { by: 1, where: { id: eventId } },
        { transaction: options.transaction }
    );
});

EventRegistration.afterDestroy(async (registration, options) => {
    const { eventId } = registration;

    await Event.decrement('participantAmount',
        { by: 1, where: { id: eventId } },
        { transaction: options.transaction }
    );
});

module.exports = EventRegistration;