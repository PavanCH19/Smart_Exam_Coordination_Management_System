const Joi = require("joi");

const studentFields = {
    usn: Joi.string().trim().max(50).required(),
    name: Joi.string().trim().max(255).required(),
    email: Joi.string().trim().email().max(255).required(),
    phone: Joi.string().trim().max(15).allow(null, ""),
    department: Joi.string().trim().max(100).required(),
    semester: Joi.number().integer().min(1).required(),
    section: Joi.string().trim().max(10).required(),
    course: Joi.string().trim().max(100).required()
};

const createStudentSchema = Joi.object(studentFields);

const updateStudentSchema = Joi.object(
    Object.fromEntries(
        Object.entries(studentFields).map(([field, schema]) => [field, schema.optional()])
    )
).min(1);

module.exports = {
    createStudentSchema,
    updateStudentSchema
};