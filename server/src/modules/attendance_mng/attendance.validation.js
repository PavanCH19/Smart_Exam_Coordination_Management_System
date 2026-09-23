const Joi = require("joi");

const markAttendanceSchema = Joi.object({
    status: Joi.string().valid("PRESENT", "ABSENT").required()
});

const bulkAttendanceSchema = Joi.object({
    updates: Joi.array().items(
        Joi.object({
            student_id: Joi.number().integer().required(),
            status: Joi.string().valid("PRESENT", "ABSENT").required()
        })
    ).min(1).required()
});

module.exports = {
    markAttendanceSchema,
    bulkAttendanceSchema
};
