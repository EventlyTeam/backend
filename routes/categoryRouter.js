const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware');
const categoryController = require('../controllers/categoryController')

router.post('/', authMiddleware, adminMiddleware, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', authMiddleware, adminMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, adminMiddleware, categoryController.deleteCategory);

module.exports = router