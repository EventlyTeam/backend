
const ChatMessage = require('../models/chatMessage');
const SocketIOResponse = require('../models/socketIOResponse');
const User = require('../models/user');

class ChatMessageController {
    async sendMessage(message, socket, io, socketCb) {
        try {
            const chatRoomId = socket.chatRoomId;
            const user = socket.user;

            if (!chatRoomId || !message) {
                socketCb(SocketIOResponse.badRequest('Chat user must join to chat at first. Message is required'));
                return;
            }

            const chatMessage = await ChatMessage.create({
                userId: user.id,
                chatRoomId,
                message,
            });

            const messageData = await ChatMessage.findOne({
                where: { id: chatMessage.id },
                include: {
                    model: User,
                    attributes: ['username'],
                }
            });

            await io.to(chatRoomId).emit('newMessage', messageData);

            const successResponse = new SocketIOResponse(201, 'Message was sent successfully', messageData);

            socketCb(successResponse);
        } catch (error) {
            socketCb(SocketIOResponse.internal('Failed to send message'));
        }
    }

    async getChatMessages(chatRoomId, socketCb, offset = 0, limit = 20) {
        try {
            if (!chatRoomId) {
                socketCb(SocketIOResponse.badRequest('Chat user must join to chat at first. Message is required'));
                return;
            }

            if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit <= 0) {
                socketCb(SocketIOResponse.badRequest('Offset and limit must be non-negative integers'));
                return;
            }
    
            const messages = await ChatMessage.findAll({
                where: { chatRoomId },
                include: {
                    model: User,
                    as: 'user',
                    attributes: ['username']
                },
                limit,
                offset,
                order: [['createdAt', 'DESC']],
            });
    
            const successResponse = new SocketIOResponse(200, 'Messages fetched successfully', messages);
            socketCb(successResponse);
        } catch (error) {
            socketCb(SocketIOResponse.internal('Failed to fetch messages'));
        }
    }
    
}

module.exports = new ChatMessageController();