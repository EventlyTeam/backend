const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware');
const cityController = require('../controllers/cityController')

router.post('/', authMiddleware, adminMiddleware, cityController.createCity);
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCityById);
router.put('/:id', authMiddleware, adminMiddleware, cityController.updateCity);
router.delete('/:id', authMiddleware, adminMiddleware, cityController.deleteCity);

module.exports = router