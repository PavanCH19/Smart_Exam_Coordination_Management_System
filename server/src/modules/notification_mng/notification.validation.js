const Joi = require("joi");

const sendNotificationSchema = Joi.object({
    title: Joi.string().trim().max(150).required(),
    message: Joi.string().trim().required(),
    audience: Joi.string().valid("ALL", "STUDENTS", "STAFF").required(),
    type: Joi.string().valid("INFO", "REMINDER", "ALERT").required()
});

module.exports = { sendNotificationSchema };
