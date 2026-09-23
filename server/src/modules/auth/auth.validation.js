const Joi = require("joi");

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "A valid email is required",
        "any.required": "Email is required"
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "Password is required"
    })
});

const changePasswordSchema = Joi.object({
    current_password: Joi.string().min(6).required().messages({
        "string.min": "Current password must be at least 6 characters",
        "any.required": "Current password is required"
    }),
    new_password: Joi.string().min(8).required().messages({
        "string.min": "New password must be at least 8 characters",
        "any.required": "New password is required"
    })
});

module.exports = {
    loginSchema,
    changePasswordSchema
};
