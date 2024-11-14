const ApiError = require('../error/ApiError');
const City = require('../models/city');
const Country = require('../models/country');
const verifyAdminRole = require('../utils/VerifyAdminRole')

class CityController {
    async createCity(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { name, countryId } = req.body;
            if (!name || !countryId) {
                return next(ApiError.badRequest('City name and country ID are required'));
            }

            const country = await Country.findByPk(countryId);
            if (!country) {
                return next(ApiError.badRequest('Country not found'));
            }

            const city = await City.create({ name, countryId });
            return res.status(201).json(city);
        } catch (error) {
            return next(ApiError.internal('Error creating city'));
        }
    }

    async getAllCities(req, res, next) {
        try {
            const cities = await City.findAll({ include: Country });
            return res.status(200).json(cities);
        } catch (error) {
            return next(ApiError.internal('Error retrieving cities'));
        }
    }

    async getCityById(req, res, next) {
        try {
            const { id } = req.params;
            const city = await City.findByPk(id, { include: Country });

            if (!city) {
                return next(ApiError.badRequest('City not found'));
            }

            return res.status(200).json(city);
        } catch (error) {
            return next(ApiError.internal('Error retrieving city'));
        }
    }

    async updateCity(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const { name, countryId } = req.body;

            const city = await City.findByPk(id);
            if (!city) {
                return next(ApiError.badRequest('City not found'));
            }

            if (countryId) {
                const country = await Country.findByPk(countryId);
                if (!country) {
                    return next(ApiError.badRequest('Country not found'));
                }
            }

            city.name = name || city.name;
            city.countryId = countryId || city.countryId;
            
            await city.save();

            return res.status(200).json(city);
        } catch (error) {
            return next(ApiError.internal('Error updating city'));
        }
    }

    async deleteCity(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const city = await City.findByPk(id);

            if (!city) {
                return next(ApiError.badRequest('City not found'));
            }

            await city.destroy();
            
            return res.status(200).json({ message: 'City deleted successfully' });
        } catch (error) {
            return next(ApiError.internal('Error deleting city'));
        }
    }
}

module.exports = new CityController();