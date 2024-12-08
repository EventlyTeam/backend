const Event = require('../models/event');
const Photo = require('../models/photo');
const ApiError = require('../error/ApiError');
const ImageConverter = require('../utils/ImageConverter');

const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const sequelize = require('../config/sequelize');
const EventRegistration = require('../models/eventRegistration');

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
                location,
                cityId,
                categoryId,
                formatId,
                photoDescriptions
            } = req.body;

            if (!title || !startDate || !endDate || !cityId || !categoryId || !formatId) {
                return next(ApiError.badRequest(
                    'Missing required fields: title, startDate, endDate, cityId, categoryId, and formatId are required.'
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
                location,
                organizerId, 
                cityId, 
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

            const eventWithPhotos = await Event.findByPk(event.id, {
                include: { model: Photo, as: 'photos'}
            });
            
            res.status(201).json(eventWithPhotos);
        } catch (error) {
            await transaction.rollback();
            next(ApiError.badRequest(error.message));
        }
    }
    
    async getEvents(req, res, next) {
        try {
            const { title, location, cityId, categoryId, formatId, start, end, limit = 10, offset = 0 } = req.query;
            const searchCriteria = {};
            
            if (title) {
                searchCriteria.title = { [Op.iLike]: `%${title}%` };
            }
            if (location) {
                searchCriteria.location = { [Op.iLike]: `%${location}%` };
            }
            if (cityId) {
                searchCriteria.cityId = { [Op.eq]: cityId };
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
            next(ApiError.internal(error.message));
        }
    }    
    
    async getEventById(req, res, next) {
        try {
            const { id } = req.params;
            const event = await Event.findByPk(id);
        
            if (!event) {
                return next(ApiError.notFound('Event not found'));
            }
            
            let photos = await Photo.findAll({
                where: {
                    eventId: event.id
                }
            })
            
            let eventPhotos = [];
            if (photos.length > 0) {
                eventPhotos = await Promise.all(
                    photos.map(async photo => await ImageConverter.getBase64(photo.uri))
                );
            }
    
            res.status(200).json({
                ...event.dataValues,
                photos: eventPhotos
            });
        } catch (error) {
            next(ApiError.internal(error.message));
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
                location,
                cityId,
                categoryId,
                formatId,
                photoDescriptions
            } = req.body;

            const { id } = req.params;
            const organizerId = req.user.id;
    
            const event = await Event.findByPk(id);
            if (!event) {
                return next(ApiError.notFound('Event not found'));
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
                location,
                cityId,
                categoryId,
                formatId
            };

            await Event.update(updatedFields, {
                where: { id: id },
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
            res.status(200).json({message: 'Event was updated successfully'});
        } catch (error) {
            await transaction.rollback();
            next(ApiError.badRequest(error.message));
        }
    }
    
    async deleteEvent(req, res, next) {
        try {
            const { id } = req.params;
    
            const event = await Event.findByPk(id);
            const eventOrganizerId = event.organizerId;

            if (eventOrganizerId !== req.user.id) {
                return next(ApiError.forbidden('Only organizer can delete event!'));
            }

            const deleted = await Event.destroy({
                where: { id: id }
            });

            if (!deleted) {
                return next(ApiError.notFound('Event not found'));
            }

            res.status(200).json({
                message: 'Event was deleted successfully!'
            });
        } catch (error) {
            next(ApiError.internal(error.message));
        }
    }

    async registerForEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
    
            const event = await Event.findByPk(id);
            if (!event) {
                return next(ApiError.notFound('Event not found'));
            }
    
            if (event.capacity) {
                const totalRegistered = event.participantAmount;
    
                if (totalRegistered === event.capacity) {
                    return next(ApiError.badRequest('Event is at full capacity'));
                }
            }
    
            const existingRegistration = await EventRegistration.findOne({
                where: { userId, id }
            });
    
            if (existingRegistration) {
                return next(ApiError.badRequest('You are already registered for this event'));
            }
    
            const registration = await EventRegistration.create({ userId, id });
    
            res.status(201).json({
                message: 'You have successfully registered for the event!',
                registration
            });
        } catch (error) {
            next(ApiError.internal("Error while registering for event"));
        }
    }

    async unregisterFromEvent(req, res, next) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
    
            const event = await Event.findByPk(id);
            if (!event) {
                return next(ApiError.notFound('Event not found'));
            }
    
            const existingRegistration = await EventRegistration.findOne({
                where: { userId, id }
            });
    
            if (!existingRegistration) {
                return next(ApiError.badRequest('You are not registered for this event'));
            }
    
            await existingRegistration.destroy();
    
            res.status(200).json({
                message: 'You have successfully unregistered from the event!',
            });
        } catch (error) {
            next(ApiError.internal("Error while unregistering from event"));
        }
    }
}

module.exports = new EventController();