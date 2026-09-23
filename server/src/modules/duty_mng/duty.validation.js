const Joi = require("joi");

const createDutySchema = Joi.object({
    // The frontend's staff dropdown submits employee_id (a string), not the
    // internal numeric staff_id — resolved server-side in the service layer.
    staff_id: Joi.string().trim().required(),
    room_id: Joi.number().integer().required(),
    duty_type: Joi.string().valid("MAIN", "STANDBY").required()
});

const updateDutySchema = Joi.object({
    staff_id: Joi.string().trim(),
    room_id: Joi.number().integer(),
    duty_type: Joi.string().valid("MAIN", "STANDBY")
}).min(1);

const dutyAttendanceSchema = Joi.object({
    status: Joi.string().valid("PRESENT", "ABSENT").required()
});

module.exports = {
    createDutySchema,
    updateDutySchema,
    dutyAttendanceSchema
};
