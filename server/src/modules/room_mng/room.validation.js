const Joi = require("joi");

const ROOM_TYPES = ["Classroom", "Hall", "Laboratory", "Auditorium", "Seminar Hall"];
const ROOM_STATUSES = ["AVAILABLE", "UNAVAILABLE", "MAINTENANCE"];

const createRoomSchema = Joi.object({
    room_number: Joi.string().trim().max(20).required(),
    building: Joi.string().trim().max(100).required(),
    floor: Joi.number().integer().min(0).required(),
    capacity: Joi.number().integer().min(1).required(),
    room_type: Joi.string().valid(...ROOM_TYPES).required(),
    status: Joi.string().valid(...ROOM_STATUSES)
});

const updateRoomSchema = Joi.object({
    room_number: Joi.string().trim().max(20),
    building: Joi.string().trim().max(100),
    floor: Joi.number().integer().min(0),
    capacity: Joi.number().integer().min(1),
    room_type: Joi.string().valid(...ROOM_TYPES),
    status: Joi.string().valid(...ROOM_STATUSES)
}).min(1);

const updateRoomStatusSchema = Joi.object({
    status: Joi.string().valid(...ROOM_STATUSES).required()
});

module.exports = {
    createRoomSchema,
    updateRoomSchema,
    updateRoomStatusSchema
};
