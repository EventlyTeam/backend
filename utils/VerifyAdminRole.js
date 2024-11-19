const Role = require("../models/role");
const User = require("../models/user");

module.exports = async (userId, next) => {
    let user = await User.findByPk(userId);
    if (!user) {
        next(ApiError.badRequest('User not found'));
    }

    let userRole = await Role.findByPk(user.roleId);
    if (!userRole || userRole.name !== 'admin') {
        next(ApiError.forbidden('Only admin can create countries'));
    }
};