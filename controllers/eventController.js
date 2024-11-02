const Event = require('../models/event');
const ApiError = require('../error/ApiError');
const ImageConverter = require('../utils/ImageConverter');

const { Op } = require('sequelize')

class EventController {
    
    async createEvent(req, res, next) {
        try {
            const { name, description, location, startDate, endDate, capacity, category, price, status } = req.body;
            const imageUrls = req.files ? req.files.map(file => file.path) : [];
            const organizerId = req.userId;
    
            const event = await Event.create({
                name, description, location, startDate, endDate, capacity, organizerId, category, price, status, imageUrls
            });
    
            res.status(201).json(event);
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
    
    async getEvents(req, res, next) {
        try {
            const { name, location, category, start, end, limit = 10, offset = 0 } = req.query;
            
            const searchCriteria = {};
            
            if (name) {
                searchCriteria.name = { [Op.iLike]: `%${name}%` };
            }
            if (location) {
                searchCriteria.location = { [Op.eq]: location };
            }
            if (category) {
                searchCriteria.category = { [Op.eq]: category };
            }
            if (start) {
                searchCriteria.startDate = { [Op.gte]: new Date(start) };
            }
            if (end) {
                searchCriteria.endDate = { [Op.lte]: new Date(end) };
            }
    
            const events = await Event.findAndCountAll({
                where: searchCriteria,
                limit: parseInt(limit),
                offset: parseInt(offset),
            });

            const eventsWithBase64Images = await Promise.all(events.rows.map(async event => {
                const base64Images = event.imageUrls ? await Promise.all(
                    event.imageUrls.map(async url => {
                        return await ImageConverter.getBase64(url);
                    })
                ) : [];
    
                return {
                    ...event.dataValues,
                    imageUrls: base64Images
                };
            }));
            
            res.status(200).json({
                total: events.count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                events: eventsWithBase64Images
            });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }    
    
    async getEventById(req, res, next) {
        try {
            const eventId = req.params.id;
            const event = await Event.findByPk(eventId);
        
            if (!event) {
                return next(ApiError.badRequest('Event not found'));
            }
            
            if (event.imageUrl) {
                event.imageUrls = await Promise.all(
                    event.imageUrls.map(async url => await ImageConverter.getBase64(url))
                );
            }
    
            res.status(200).json(event);
        } catch (error) {
            console.log(error)
            next(ApiError.internal(error.message));
        }
    }
    
    async updateEvent(req, res, next) {
        try {
            const { name, description, location, startDate, endDate, capacity, category, price, status } = req.body;
            const eventId = req.params.id;
            const imageUrls = req.files ? req.files.map(file => file.path) : [];
            const organizerId = req.userId;
    
            const event = await Event.findByPk(eventId);
            if (!event) {
                return next(ApiError.badRequest('Event not found'));
            }

            if (event.organizerId !== organizerId) {
                return next(ApiError.forbidden('Only event organizer can update this event'));
            }

            const updatedFields = {
                name, description, location, startDate, endDate, capacity, category, price, status
            };
            
            if (imageUrls) {
                updatedFields.imageUrls = imageUrls;
            }

            await Event.update(updatedFields, {
                where: { id: eventId }
            });

            res.status(200).json('Event was updated successfully');
        } catch (error) {
            next(ApiError.badRequest(error.message));
        }
    }
    
    async deleteEvent(req, res, next) {
        try {
            const eventId = req.params.id;
            const event = await Event.findByPk(eventId);
            const eventOrganizerId = event.organizerId;

            if (eventOrganizerId !== req.userId) {
                return next(ApiError.forbidden('Only organizer can delete event!'));
            }

            const deleted = await Event.destroy({
                where: { id: eventId }
            });

            if (!deleted) {
                return next(ApiError.badRequest('Event not found'));
            }

            res.status(200).json({
                message: 'Event was deleted successfully!'
            });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }    
}

module.exports = new EventController();