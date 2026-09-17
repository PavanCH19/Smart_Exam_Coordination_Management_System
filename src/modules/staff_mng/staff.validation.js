const Joi = require("joi");

const createStaffSchema = Joi.object({
    employee_id: Joi.string().max(50).required(),
    name: Joi.string().max(255).required(),
    department: Joi.string().max(100).required(),
    email: Joi.string().email().max(255).required(),
    phone: Joi.string().max(15).allow(null, ""),
    designation: Joi.string().max(100).required(),
    availability: Joi.string().valid("AVAILABLE", "UNAVAILABLE", "ON_LEAVE")
});

const updateStaffSchema = Joi.object({
    employee_id: Joi.string().max(50),
    name: Joi.string().max(255),
    department: Joi.string().max(100),
    email: Joi.string().email().max(255),
    phone: Joi.string().max(15).allow(null, ""),
    designation: Joi.string().max(100),
    availability: Joi.string().valid("AVAILABLE", "UNAVAILABLE", "ON_LEAVE")
}).min(1);

const updateAvailabilitySchema = Joi.object({
    availability: Joi.string().valid("AVAILABLE", "UNAVAILABLE", "ON_LEAVE").required()
});

module.exports = {
    createStaffSchema,
    updateStaffSchema,
    updateAvailabilitySchema
};
