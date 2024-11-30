const Event = require('../models/event');
const Photo = require('../models/photo');
const ApiError = require('../error/ApiError');
const ImageConverter = require('../utils/ImageConverter');

const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');

class EventController {
    
    async createEvent(req, res, next) {
        const transaction = await sequelize.transaction();
        try {
            const {
                title,
                description,
                startDate,
                endDate,
                capacity,
                ageLimit,
                isPublic,
                locationId,
                categoryId,
                formatId,
                photoDescriptions
            } = req.body;

            if (!title || !startDate || !endDate || !locationId || !categoryId || !formatId) {
                return next(ApiError.badRequest(
                    'Missing required fields: title, startDate, endDate, locationId, categoryId, and formatId are required.'
                ));
            }

            const secretCode = uuidv4();
            const organizerId = req.user.id;
    
            const event = await Event.create({
                title, 
                description, 
                startDate, 
                endDate, 
                capacity, 
                ageLimit, 
                isPublic,
                secretCode,
                organizerId, 
                locationId, 
                categoryId, 
                formatId
            }, {
                transaction
            });

            if (req.files && req.files.length > 0) {
                let photos = req.files.map(file => {
                    return {
                        uri: file.path,
                        description: photoDescriptions && photoDescriptions[file.originalname] || null,
                        eventId: event.id
                    }
                });
                
                await Photo.bulkCreate(photos, { transaction });
            }

            await transaction.commit();

            const eventWithPhotos = await Event.findByPk(event.id, {include: {model: Photo, as: 'photos'}})
            res.status(201).json(eventWithPhotos);
        } catch (error) {
            await transaction.rollback();
            return next(ApiError.badRequest(error.message));
        }
    }
    
    async getEvents(req, res, next) {
        try {
            const { title, locationId, categoryId, formatId, start, end, limit = 10, offset = 0 } = req.query;
            const searchCriteria = {};
            
            if (title) {
                searchCriteria.title = { [Op.iLike]: `%${title}%` };
            }
            if (locationId) {
                searchCriteria.locationId = { [Op.eq]: locationId };
            }
            if (categoryId) {
                searchCriteria.categoryId = { [Op.eq]: categoryId };
            }
            if (formatId) {
                searchCriteria.formatId = { [Op.eq]: formatId };
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

            const eventIds = events.rows.map(event => event.id);
            const photos = await Photo.findAll({
                where: { eventId: eventIds }
            });

            const eventsWithBase64Images = await Promise.all(events.rows.map(async event => {
                const eventPhotos = photos.filter(photo => photo.eventId === event.id);
                const base64Images = await Promise.all(
                    eventPhotos.map(async photo => {
                        return await ImageConverter.getBase64(photo.uri);
                    })
                );
    
                return {
                    ...event.dataValues,
                    photos: base64Images
                };
            }));
            
            res.status(200).json({
                total: events.count,
                limit: parseInt(limit),
                offset: parseInt(offset),
                events: eventsWithBase64Images
            });
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }    
    
    async getEventById(req, res, next) {
        try {
            const eventId = req.params.id;
            const event = await Event.findByPk(eventId);
        
            if (!event) {
                return next(ApiError.badRequest('Event not found'));
            }
            
            let photos = await Photo.findAll({
                where: {
                    eventId: event.id
                }
            })
            if (photos.length > 0) {
                event.photos = await Promise.all(
                    photos.map(async photo => await ImageConverter.getBase64(photo.uri))
                );
            } else {
                event.photos = [];
            }
    
            res.status(200).json(event);
        } catch (error) {
            return next(ApiError.internal(error.message));
        }
    }
    
    async updateEvent(req, res, next) {
        const transaction = await sequelize.transaction();
        try {
            const {
                title,
                description,
                startDate,
                endDate,
                capacity,
                ageLimit,
                isPublic,
                locationId,
                categoryId,
                formatId,
                photoDescriptions
            } = req.body;

            const eventId = req.params.id;
            const organizerId = req.user.id;
    
            const event = await Event.findByPk(eventId);
            if (!event) {
                return next(ApiError.badRequest('Event not found'));
            }

            if (event.organizerId !== organizerId) {
                return next(ApiError.forbidden('Only event organizer can update this event'));
            }

            const updatedFields = {
                title,
                description,
                startDate,
                endDate,
                capacity,
                ageLimit,
                isPublic,
                locationId,
                categoryId,
                formatId
            };

            await Event.update(updatedFields, {
                where: { id: eventId },
                transaction
            });

            if (req.files && req.files.length > 0) {
                const photos = req.files.map(file => {
                    return {
                        uri: file.path,
                        description: photoDescriptions[file.originalname] || null,
                        eventId: event.id
                    }
                });
                
                await Photo.destroy({
                    where: {
                        eventId: event.id
                    },
                    transaction
                });

                await Photo.bulkCreate(photos, { transaction });
            }

            await transaction.commit();
            res.status(200).json('Event was updated successfully');
        } catch (error) {
            await transaction.rollback();
            return next(ApiError.badRequest(error.message));
        }
    }
    
    async deleteEvent(req, res, next) {
        try {
            const eventId = req.params.id;
            const event = await Event.findByPk(eventId);
            const eventOrganizerId = event.organizerId;

            if (eventOrganizerId !== req.user.id) {
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
            return next(ApiError.internal(error.message));
        }
    }    
}

module.exports = new EventController();