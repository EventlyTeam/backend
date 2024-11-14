const ApiError = require('../error/ApiError');
const Location = require('../models/location');
const City = require('../models/city');
const verifyAdminRole = require('../utils/VerifyAdminRole')

class LocationController {
    async createLocation(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { details, cityId } = req.body;
            if (!cityId) {
                return next(ApiError.badRequest('City ID is required'));
            }

            const city = await City.findByPk(cityId);
            if (!city) {
                return next(ApiError.badRequest('City not found'));
            }

            const location = await Location.create({ details, cityId });
            return res.status(201).json(location);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Error creating location'));
        }
    }

    async getAllLocations(req, res, next) {
        try {
            const locations = await Location.findAll({ include: City });
            return res.status(200).json(locations);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Error retrieving locations'));
        }
    }

    async getLocationById(req, res, next) {
        try {
            const { id } = req.params;
            const location = await Location.findByPk(id, { include: City });

            if (!location) {
                return next(ApiError.badRequest('Location not found'));
            }

            return res.status(200).json(location);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Error retrieving location'));
        }
    }

    async updateLocation(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const { details, cityId } = req.body;

            const location = await Location.findByPk(id);
            if (!location) {
                return next(ApiError.badRequest('Location not found'));
            }

            if (cityId) {
                const city = await City.findByPk(cityId);
                if (!city) {
                    return next(ApiError.badRequest('City not found'));
                }
            }

            location.details = details || location.details;
            location.cityId = cityId || location.cityId;
            await location.save();

            return res.status(200).json(location);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Error updating location'));
        }
    }

    async deleteLocation(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const location = await Location.findByPk(id);

            if (!location) {
                return next(ApiError.badRequest('Location not found'));
            }

            await location.destroy();
            return res.status(200).json({ message: 'Location deleted successfully' });
        } catch (error) {
            console.error(error);
            return next(ApiError.internal('Error deleting location'));
        }
    }
}

module.exports = new LocationController();