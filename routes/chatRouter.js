const express = require('express')

const router = express.Router()

const authMiddleware = require('../middleware/authMiddleware')
const chatRoomController = require('../controllers/chatRoomController')

router.post('/', authMiddleware, chatRoomController.createChatRoom);
router.delete('/:id', authMiddleware, chatRoomController.deleteChatRoom);
router.get('/:id', authMiddleware, chatRoomController.getEventChatRoomId);

module.exports = router;