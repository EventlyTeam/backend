const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const cityController = require('../controllers/cityController')

router.post('/', authMiddleware, cityController.createCity);
router.get('/', cityController.getAllCities);
router.get('/:id', cityController.getCityById);
router.put('/:id', authMiddleware, cityController.updateCity);
router.delete('/:id', authMiddleware, cityController.deleteCity);

module.exports = router