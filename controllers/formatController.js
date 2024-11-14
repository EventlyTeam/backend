const ApiError = require('../error/ApiError');
const Format = require('../models/format');
const verifyAdminRole = require('../utils/VerifyAdminRole')

class FormatController {

    async createFormat(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { title, description } = req.body;
            if (!title || !description) {
                return next(ApiError.badRequest('Title and description are required'));
            }

            const format = await Format.create({ title, description });
            return res.status(201).json(format);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Error creating format'));
        }
    }

    async getAllFormats(req, res, next) {
        try {
            const formats = await Format.findAll();
            return res.status(200).json(formats);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Error fetching formats'));
        }
    }

    async getFormatById(req, res, next) {
        try {
            const { id } = req.params;
            const format = await Format.findByPk(id);

            if (!format) {
                return next(ApiError.badRequest('Format not found'));
            }

            return res.status(200).json(format);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Error fetching format'));
        }
    }

    async updateFormat(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const { title, description } = req.body;

            if (!title && !description) {
                return next(ApiError.badRequest('At least one of title or description is required'));
            }

            const format = await Format.findByPk(id);
            if (!format) {
                return next(ApiError.badRequest('Format not found'));
            }

            if (title) format.title = title;
            if (description) format.description = description;
            await format.save();

            return res.status(200).json(format);
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Error updating format'));
        }
    }

    async deleteFormat(req, res, next) {
        try {
            await verifyAdminRole(req.userId, next);

            const { id } = req.params;
            const format = await Format.findByPk(id);

            if (!format) {
                return next(ApiError.badRequest('Format not found'));
            }

            await format.destroy();
            return res.status(200).json({ message: 'Format deleted successfully' });
        } catch (error) {
            console.log(error);
            return next(ApiError.internal('Error deleting format'));
        }
    }
}

module.exports = new FormatController();