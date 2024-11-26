const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize')
const Role = require('./role')

const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  emailVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
        model: Role,
        key: 'id'
    },
  },
}, {
  hooks: {
    beforeCreate: async (userInstance) => {
      if (!userInstance.roleId) {
        const role = await Role.findOne({ where: { name: 'user' } });
        if (role) {
          userInstance.roleId = role.id;
        }
      }
    }
  }
});

Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

module.exports = User