const Joi = require("joi");

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const STATUSES = ["SCHEDULED", "COMPLETED", "CANCELLED"];
const SESSIONS = ["MORNING", "EVENING"];

const createExamSchema = Joi.object({
    subject_id: Joi.number().integer().required(),
    exam_date: Joi.date().iso().required(),
    start_time: Joi.string().pattern(TIME_PATTERN).required().messages({
        "string.pattern.base": "start_time must be in HH:MM format"
    }),
    end_time: Joi.string().pattern(TIME_PATTERN).required().messages({
        "string.pattern.base": "end_time must be in HH:MM format"
    }),
    exam_session: Joi.string().valid(...SESSIONS).default("MORNING"),
    status: Joi.string().valid(...STATUSES),
    department: Joi.string().trim().max(100).allow(null, ""),
    semester: Joi.number().integer().allow(null)
});

const updateExamSchema = Joi.object({
    subject_id: Joi.number().integer(),
    exam_date: Joi.date().iso(),
    start_time: Joi.string().pattern(TIME_PATTERN).messages({
        "string.pattern.base": "start_time must be in HH:MM format"
    }),
    end_time: Joi.string().pattern(TIME_PATTERN).messages({
        "string.pattern.base": "end_time must be in HH:MM format"
    }),
    exam_session: Joi.string().valid(...SESSIONS),
    status: Joi.string().valid(...STATUSES),
    department: Joi.string().trim().max(100).allow(null, ""),
    semester: Joi.number().integer().allow(null)
}).min(1);

const generateTimetableSchema = Joi.object({
    department: Joi.string().trim().required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    start_date: Joi.date().iso().required(),
    end_date: Joi.date().iso().min(Joi.ref("start_date")).required()
});

module.exports = {
    createExamSchema,
    updateExamSchema,
    generateTimetableSchema
};
