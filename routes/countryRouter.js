const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMiddleware');
const countryController = require('../controllers/countryController')

router.post('/', authMiddleware, adminMiddleware, countryController.createCountry);
router.get('/', countryController.getAllCountries);
router.get('/:id', countryController.getCountryById);
router.put('/:id', authMiddleware, adminMiddleware, countryController.updateCountry);
router.delete('/:id', authMiddleware, adminMiddleware, countryController.deleteCountry);

module.exports = router