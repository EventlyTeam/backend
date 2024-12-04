const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user')
const Category = require('./category')
const Format = require('./format');
const City = require('./city');

const Event = sequelize.define('Event', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  participantAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  ageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  secretCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'id'
    }
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: City,
        key: 'id'
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Category,
        key: 'id'
    }
  },
  formatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Format,
        key: 'id'
    }
  }
});

Event.belongsTo(User, { foreignKey: 'organizerId' });
User.hasMany(Event, { foreignKey: 'organizerId' });

Event.belongsTo(Format, { foreignKey: 'formatId' });
Format.hasMany(Event, { foreignKey: 'formatId' });

Event.belongsTo(City, { foreignKey: 'cityId' });
City.hasMany(Event, { foreignKey: 'cityId' });

Event.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Event, { foreignKey: 'categoryId' });

module.exports = Event;