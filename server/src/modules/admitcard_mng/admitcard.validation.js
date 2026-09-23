const Joi = require("joi");

const generateAdmitCardsSchema = Joi.object({
    department: Joi.string().trim().allow(null, ""),
    semester: Joi.number().integer().allow(null, "")
});

module.exports = { generateAdmitCardsSchema };
