const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const User = require('./user')
const Location = require('./location')
const Category = require('./category')
const Format = require('./format')

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
  organizerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: User,
        key: 'id'
    }
  },
  locationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Location,
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

Event.belongsTo(Location, { foreignKey: 'locationId' });
Location.hasMany(Event, { foreignKey: 'locationId' });

Event.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Event, { foreignKey: 'categoryId' });

module.exports = Event;