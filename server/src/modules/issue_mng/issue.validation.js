const Joi = require("joi");

const ISSUE_TYPES = ["STUDENT_PROBLEM", "QUESTION_PAPER", "INFRASTRUCTURE", "INVIGILATOR", "OTHER"];
const STATUSES = ["OPEN", "IN PROGRESS", "RESOLVED"];

const createIssueSchema = Joi.object({
    issue_type: Joi.string().valid(...ISSUE_TYPES).required(),
    description: Joi.string().trim().required(),
    duty_id: Joi.number().integer().allow(null, "")
});

const updateIssueStatusSchema = Joi.object({
    status: Joi.string().valid(...STATUSES).required()
});

module.exports = {
    createIssueSchema,
    updateIssueStatusSchema
};
