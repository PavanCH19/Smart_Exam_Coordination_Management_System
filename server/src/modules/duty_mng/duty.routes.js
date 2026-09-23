const express = require("express");

const dutyController = require("./duty.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { createDutySchema } = require("./duty.validation");

// mergeParams so :examId from the parent mount path is visible here
const router = express.Router({ mergeParams: true });

// List staff duties for an exam
router.get( "/", authenticate, authorize("ADMIN", "STAFF"), dutyController.getDutiesByExamId );

// Assign a staff member to a duty for an exam
router.post( "/", authenticate, authorize("ADMIN"), validate(createDutySchema), dutyController.addDuty );

module.exports = router;
