const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware')
const formatController = require('../controllers/formatController')

router.post('/', authMiddleware, adminMiddleware, formatController.createFormat);
router.get('/', formatController.getAllFormats);
router.get('/:id', formatController.getFormatById);
router.put('/:id', authMiddleware, adminMiddleware, formatController.updateFormat);
router.delete('/:id', authMiddleware, adminMiddleware, formatController.deleteFormat);

module.exports = router