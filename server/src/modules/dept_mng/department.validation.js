const Joi = require("joi");

const createDepartmentSchema = Joi.object({
    name: Joi.string().max(100).required(),
    code: Joi.string().max(20).required(),
    description: Joi.string().max(500).allow(null, "")
});

const updateDepartmentSchema = Joi.object({
    name: Joi.string().max(100),
    code: Joi.string().max(20),
    description: Joi.string().max(500).allow(null, "")
}).min(1);

module.exports = {
    createDepartmentSchema,
    updateDepartmentSchema
};
