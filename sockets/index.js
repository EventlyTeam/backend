const jwt = require('jsonwebtoken');
const chatMessageController = require('../controllers/chatMessageController')
const SocketIOResponse = require('../models/socketIOResponse');
const {forbidden, internal, notFound, response} = SocketIOResponse;
const ChatRoom = require('../models/chatRoom');
const EventRegistration = require('../models/eventRegistration');

module.exports = (io) => {
    const responseCallback = (socket) => {
        return (res) => {
            socket.emit(response, res);
        }
    };

    io.use((socket, next) => {
        const token = socket.handshake.headers['authorization'];

        if (!token) {
            return next(new Error('JWT token is required'));
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            return next(new Error('Invalid JWT token'));
        }
    });

    io.on('connection', (socket) => {
        socket.on('sendMessage', async (message) => {
            await chatMessageController.sendMessage(message, socket, io, responseCallback(socket))
        });

        socket.on('joinRoom', async (chatRoomId) => {
            if (!chatRoomId) {
                socket.emit(response, badRequest('Chat room ID is required to join a room.'));
                return;
            }

            const chatRoom = await ChatRoom.findByPk(chatRoomId);
            if (!chatRoom) {
                socket.emit(response, notFound('Chat room not found.'));
                return;
            }

            const userEventRegistration = await EventRegistration.findOne({
                where: {
                    userId: socket.user.id,
                    eventId: chatRoom.eventId
                }
            });

            if (!userEventRegistration) {
                socket.emit(response, forbidden('Only event participants can join event chat room'));
                return;
            }

            socket.join(chatRoomId);
            socket.chatRoomId = chatRoomId;

            await chatMessageController.getChatMessages(chatRoomId, responseCallback(socket));
        });

        socket.on('getMessages', async (offset, limit) => {
            await chatMessageController.getChatMessages(socket.chatRoomId, responseCallback(socket), offset, limit);
        });
    })
};