const Joi = require("joi");

const ROLES = ["ADMIN", "STAFF", "STUDENT"];
const STATUSES = ["ACTIVE", "INACTIVE"];

const createUserSchema = Joi.object({
    name: Joi.string().trim().max(255).required(),
    email: Joi.string().trim().email().required(),
    role: Joi.string().valid(...ROLES).required(),
    status: Joi.string().valid(...STATUSES),
    password: Joi.string().min(8).required()
});

const updateUserSchema = Joi.object({
    name: Joi.string().trim().max(255),
    role: Joi.string().valid(...ROLES),
    status: Joi.string().valid(...STATUSES),
    password: Joi.string().min(8).allow(null, "")
}).min(1);

module.exports = {
    createUserSchema,
    updateUserSchema
};
