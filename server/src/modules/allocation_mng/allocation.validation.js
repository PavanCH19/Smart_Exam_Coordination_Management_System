const Joi = require("joi");

const createAllocationSchema = Joi.object({
    room_id: Joi.number().integer().required(),
    student_count: Joi.number().integer().min(1).required()
});

const updateAllocationSchema = Joi.object({
    room_id: Joi.number().integer(),
    student_count: Joi.number().integer().min(1)
}).min(1);

module.exports = {
    createAllocationSchema,
    updateAllocationSchema
};
