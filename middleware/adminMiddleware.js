const ApiError = require('../error/ApiError');

module.exports = (req, res, next) => {
    const role = req.user.role;

    if (role !== 'admin') {
        return next(ApiError.forbidden('Insufficient privileges'));
    }
    
    next();
};