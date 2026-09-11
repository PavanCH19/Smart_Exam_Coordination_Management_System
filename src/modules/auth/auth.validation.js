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
    oldPassword: Joi.string().min(6).required().messages({
        "string.min": "Old password must be at least 6 characters",
        "any.required": "Old password is required"
    }),
    newPassword: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "any.required": "New password is required"
    })
});

module.exports = {
    loginSchema,
    changePasswordSchema
};
