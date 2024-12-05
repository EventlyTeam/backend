const ApiError = require('../error/ApiError');
const City = require('../models/city');
const Country = require('../models/country');

class CountryController {
    async createCountry(req, res, next) {
        try {
            const { name } = req.body;
            if (!name) {
                return next(ApiError.badRequest('Country name is required'));
            }
            
            const country = await Country.create({ name });
            
            res.status(201).json(country);
        } catch (error) {
            next(ApiError.internal(error));
        }
    }

    async getAllCountries(req, res, next) {
        try {
            const countries = await Country.findAll({
                include: {
                    model: City,
                    as: 'cities'
                }
            });

            res.status(200).json(countries);
        } catch (error) {
            next(ApiError.internal(error));
        }
    }

    async getCountryById(req, res, next) {
        try {
            const { id } = req.params;
            const country = await Country.findByPk(id, {
                include: {
                    model: City,
                    as: 'cities'
                }
            });

            if (!country) {
                return next(ApiError.notFound('Country not found'));
            }

            res.status(200).json(country);
        } catch (error) {
            next(ApiError.internal(error));
        }
    }

    async updateCountry(req, res, next) {
        try {
            const { id } = req.params;
            const { name } = req.body;

            if (!name) {
                return next(ApiError.badRequest('Country name is required'));
            }

            const country = await Country.findByPk(id);
            if (!country) {
                return next(ApiError.notFound('Country not found'));
            }

            country.name = name || country.name;
            await country.save();

            res.status(200).json(country);
        } catch (error) {
            next(ApiError.internal(error));
        }
    }

    async deleteCountry(req, res, next) {
        try {
            const { id } = req.params;
            const country = await Country.findByPk(id);

            if (!country) {
                return next(ApiError.notFound('Country not found'));
            }

            await country.destroy();
            res.status(200).json({ message: 'Country deleted successfully' });
        } catch (error) {
            next(ApiError.internal(error));
        }
    }
};

module.exports = new CountryController();