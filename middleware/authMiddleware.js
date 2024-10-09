const jwt = require('jsonwebtoken');

const {non_authorized} = require('../error/ApiError');

module.exports = function (req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return next(non_authorized('No token provided, unauthorized access'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return next(non_authorized('Failed to authenticate token'));
        }

        req.userId = decoded.id;
        next();
    });
};