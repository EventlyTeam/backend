const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const formatController = require('../controllers/formatController')

router.post('/', authMiddleware, formatController.createFormat);
router.get('/', formatController.getAllFormats);
router.get('/:id', formatController.getFormatById);
router.put('/:id', authMiddleware, formatController.updateFormat);
router.delete('/:id', authMiddleware, formatController.deleteFormat);

module.exports = router