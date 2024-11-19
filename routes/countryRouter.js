const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const countryController = require('../controllers/countryController')

router.post('/', authMiddleware, countryController.createCountry);
router.get('/', countryController.getAllCountries);
router.get('/:id', countryController.getCountryById);
router.put('/:id', authMiddleware, countryController.updateCountry);
router.delete('/:id', authMiddleware, countryController.deleteCountry);

module.exports = router