const express = require("express");

const dutyController = require("./duty.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { updateDutySchema, dutyAttendanceSchema } = require("./duty.validation");

const router = express.Router();

// Update a staff duty (reassign room, change duty_type, swap staff)
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateDutySchema), dutyController.updateDuty );

// Confirm/record whether the staff member actually reported for a duty
router.patch( "/:id/attendance", authenticate, authorize("ADMIN", "STAFF"), validate(dutyAttendanceSchema), dutyController.markDutyAttendance );

// Remove a staff duty assignment
router.delete( "/:id", authenticate, authorize("ADMIN"), dutyController.deleteDuty );

module.exports = router;
