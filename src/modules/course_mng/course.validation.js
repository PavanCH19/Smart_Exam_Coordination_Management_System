const Joi = require("joi");

const createCourseSchema = Joi.object({
    name: Joi.string().max(100).required(),
    code: Joi.string().max(20).required(),
    department_id: Joi.number().integer().required(),
    duration_semesters: Joi.number().integer().min(1).allow(null)
});

const updateCourseSchema = Joi.object({
    name: Joi.string().max(100),
    code: Joi.string().max(20),
    department_id: Joi.number().integer(),
    duration_semesters: Joi.number().integer().min(1).allow(null)
}).min(1);

module.exports = {
    createCourseSchema,
    updateCourseSchema
};
