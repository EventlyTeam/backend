const express = require('express')

const router = express.Router()

const eventController = require('../controllers/eventController')
const upload = require('../middleware/multerMiddleware');

router.post('/', authMiddleware, upload.array('images'), eventController.createEvent);
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEventById);
router.put('/:id', authMiddleware, upload.array('images'), eventController.updateEvent);
router.delete('/:id', authMiddleware, eventController.deleteEvent);

module.exports = router