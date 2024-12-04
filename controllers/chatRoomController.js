const ApiError = require('../error/ApiError');
const ChatRoom = require('../models/chatRoom');
const Event = require('../models/event');

class ChatRoomController {
    async createChatRoom(req, res, next) {
        try {
            const { eventId } = req.body;

            if (!eventId) {
                return next(ApiError.badRequest('Event ID is required'));
            }

            const event = await Event.findByPk(eventId);
            if (!event) {
                return next(ApiError.notFound('No event with such id'));
            }

            const currentUserId = req.user.id;
            if (currentUserId !== event.organizerId) {
                return next(ApiError.forbidden('Only organizer can create chat for this event'));
            }

            await ChatRoom.create({ eventId });

            res.status(201).json('Chat was created successfully!');
        } catch (error) {
            next(ApiError.internal('Failed to create chat room'));
        }
    }

    async deleteChatRoom(req, res, next) {
        try {
            const { id } = req.params;
    
            const chatRoom = await ChatRoom.findByPk(id);
            if (!chatRoom) {
                return next(ApiError.notFound('No chat room with such ID'));
            }
    
            const event = await Event.findByPk(chatRoom.eventId);
            if (!event) {
                return next(ApiError.notFound('Associated event not found'));
            }
    
            const currentUserId = req.user.id;
            if (currentUserId !== event.organizerId) {
                return next(ApiError.forbidden('Only the event organizer can delete this chat room'));
            }
    
            await chatRoom.destroy();
    
            res.status(200).json({ message: 'Chat room deleted successfully!' });
        } catch (error) {
            next(ApiError.internal('Failed to delete chat room'));
        }
    }    

    async getEventChatRoomId(req, res, next) {
        try {
            const { id } = req.params;

            const chatRoom = await ChatRoom.findOne({ where: { id } });

            if (!chatRoom) {
                return next(ApiError.notFound(`Event with id: ${id} doesn't have chat room`));
            }

            res.status(200).json({ message: chatRoom });
        } catch (error) {
            next(ApiError.internal('Error fetching event chat room id'));
        }
    }
}

module.exports = new ChatRoomController();