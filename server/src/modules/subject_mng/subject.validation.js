const Joi = require("joi");

const createSubjectSchema = Joi.object({
    subject_code: Joi.string().trim().max(20).required(),
    subject_name: Joi.string().trim().max(150).required(),
    department: Joi.string().trim().max(100).required(),
    semester: Joi.number().integer().min(1).max(8).required(),
    duration: Joi.number().integer().min(30).required()
});

const updateSubjectSchema = Joi.object({
    subject_code: Joi.string().trim().max(20),
    subject_name: Joi.string().trim().max(150),
    department: Joi.string().trim().max(100),
    semester: Joi.number().integer().min(1).max(8),
    duration: Joi.number().integer().min(30)
}).min(1);

module.exports = {
    createSubjectSchema,
    updateSubjectSchema
};
