const ApiError = require('../error/ApiError');
const Category = require('../models/category');
const verifyAdminRole = require('../utils/VerifyAdminRole')

class CategoryController {

    async createCategory(req, res, next) {
        try {
            await verifyAdminRole(req.user.id, next);

            const { title, description } = req.body;
            if (!title || !description) {
                return next(ApiError.badRequest('Title and description are required'));
            }

            const category = await Category.create({ title, description });
            res.status(201).json(category);
        } catch (error) {
            next(ApiError.internal('Error creating Category'));
        }
    }

    async getAllCategories(req, res, next) {
        try {
            const categories = await Category.findAll();
            res.status(200).json(categories);
        } catch (error) {
            next(ApiError.internal('Error fetching categories'));
        }
    }

    async getCategoryById(req, res, next) {
        try {
            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return next(ApiError.notFound('Category not found'));
            }

            res.status(200).json(category);
        } catch (error) {
            next(ApiError.internal('Error fetching category'));
        }
    }

    async updateCategory(req, res, next) {
        try {
            await verifyAdminRole(req.user.id, next);

            const { id } = req.params;
            const { title, description } = req.body;

            if (!title && !description) {
                return next(ApiError.badRequest('At least one of title or description is required'));
            }

            const category = await Category.findByPk(id);
            if (!category) {
                return next(ApiError.notFound('Category not found'));
            }

            if (title) category.title = title;
            if (description) category.description = description;
            await category.save();

            res.status(200).json(category);
        } catch (error) {
            next(ApiError.internal('Error updating category'));
        }
    }

    async deleteCategory(req, res, next) {
        try {
            await verifyAdminRole(req.user.id, next);

            const { id } = req.params;
            const category = await Category.findByPk(id);

            if (!category) {
                return next(ApiError.notFound('Category not found'));
            }

            await category.destroy();
            
            res.status(200).json({ message: 'Category deleted successfully' });
        } catch (error) {
            next(ApiError.internal('Error deleting category'));
        }
    }
}

module.exports = new CategoryController();