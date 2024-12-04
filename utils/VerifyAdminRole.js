const ApiError = require("../error/ApiError");

module.exports = async (role, next) => {
    if (!role || role.name !== 'admin') {
        next(ApiError.forbidden('Insufficient privileges'));
    }
};