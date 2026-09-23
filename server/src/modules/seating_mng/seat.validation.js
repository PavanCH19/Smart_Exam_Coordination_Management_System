const Joi = require("joi");

const generateSeatingSchema = Joi.object({
    mixed: Joi.boolean().default(true)
});

const saveSeatingSchema = Joi.object({
    seats: Joi.array().items(
        Joi.object({
            seat_number: Joi.string().required(),
            student_id: Joi.number().integer().required()
        })
    ).min(1).required()
});

module.exports = {
    generateSeatingSchema,
    saveSeatingSchema
};
