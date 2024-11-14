const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const categoryController = require('../controllers/categoryController')

router.post('/', authMiddleware, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', authMiddleware, categoryController.updateCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);

module.exports = router