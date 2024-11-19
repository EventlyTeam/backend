const { DataTypes, CIDR } = require('sequelize');
const sequelize = require('../config/sequelize');
const City = require('./city')

const Location = sequelize.define('Location', {
  details: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cityId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: City,
        key: 'id'
    }
  }
});

City.hasMany(Location, { foreignKey: 'cityId' });
Location.belongsTo(City, { foreignKey: 'cityId' });

module.exports = Location;