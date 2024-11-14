const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const locationController = require('../controllers/locationController')

router.post('/', authMiddleware, locationController.createLocation);
router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.put('/:id', authMiddleware, locationController.updateLocation);
router.delete('/:id', authMiddleware, locationController.deleteLocation);

module.exports = router