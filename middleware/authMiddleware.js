const jwt = require('jsonwebtoken');

const ApiError = require('../error/ApiError');

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader) {
            return next(ApiError.nonAuthorized());
        }

        const accessToken = authorizationHeader.split(' ')[1];
        if (!accessToken) {
            return next(ApiError.nonAuthorized());
        }

        const userData = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        if (!userData) {
            return next(ApiError.nonAuthorized());
        }

        req.user = userData;
        next();
    } catch (e) {
        next(ApiError.nonAuthorized());
    }
};