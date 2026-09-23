const Joi = require("joi");

const createCourseSchema = Joi.object({
    name: Joi.string().trim().max(150).required(),
    code: Joi.string().trim().max(20).required(),
    department: Joi.string().trim().max(100).required(),
    duration_years: Joi.number().integer().min(1).max(6).required(),
    total_semesters: Joi.number().integer().min(1).max(12).required()
});

const updateCourseSchema = Joi.object({
    name: Joi.string().trim().max(150),
    code: Joi.string().trim().max(20),
    department: Joi.string().trim().max(100),
    duration_years: Joi.number().integer().min(1).max(6),
    total_semesters: Joi.number().integer().min(1).max(12)
}).min(1);

module.exports = {
    createCourseSchema,
    updateCourseSchema
};
