const express = require("express");

const attendanceController = require("./attendance.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { markAttendanceSchema, bulkAttendanceSchema } = require("./attendance.validation");

// mergeParams so :examId from the parent mount path is visible here
const router = express.Router({ mergeParams: true });

// Get the attendance roster for an exam
router.get( "/", authenticate, authorize("ADMIN", "STAFF"), attendanceController.getRoster );

// Mark one student's attendance
router.patch( "/:studentId", authenticate, authorize("ADMIN", "STAFF"), validate(markAttendanceSchema), attendanceController.markAttendance );

// Mark many students at once
router.post( "/bulk", authenticate, authorize("ADMIN", "STAFF"), validate(bulkAttendanceSchema), attendanceController.bulkMarkAttendance );

module.exports = router;
