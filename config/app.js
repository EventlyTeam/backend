require('./multer')

const Role = require('../models/role');
const User = require('../models/user');
const bcrypt = require('bcrypt');

module.exports = async () => {
  try {
    console.log('Database synced.');

    const roles = ['user', 'admin', 'moderator'];
    for (const roleName of roles) {
      await Role.findOrCreate({ where: { name: roleName } });
    }

    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    if (adminRole) {
      const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 5);
      const [adminUser, created] = await User.findOrCreate({
        where: { username: process.env.ADMIN_USERNAME },
        defaults: {
          email: process.env.ADMIN_EMAIL,
          username: process.env.ADMIN_USERNAME,
          password: password,
          roleId: adminRole.id
        }
      });
      if (created) {
        console.log('Default admin user created: ', adminUser.username);
      } else {
        console.log('Default admin user already exists.');
      }
    }
  } catch (error) {
    console.error('Error during initialization:', error);
  }
};