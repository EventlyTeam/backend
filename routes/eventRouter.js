const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const eventController = require('../controllers/eventController')
const upload = require('../middleware/multerMiddleware');

router.post('/', authMiddleware, upload.array('photos'), eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', authMiddleware, upload.array('photos'), eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);
router.post('/:id/register', authMiddleware, eventController.registerForEvent);
router.delete('/:id/unregister', authMiddleware, eventController.unregisterFromEvent);

module.exports = router