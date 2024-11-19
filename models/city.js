const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const Country = require('./country')

const City = sequelize.define('City', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    countryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Country,
            key: 'id'
        }
    }
});

Country.hasMany(City, { foreignKey: 'countryId' });
City.belongsTo(Country, { foreignKey: 'countryId' });

module.exports = City;