const express = require("express");

const examController = require("./exam.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { generateTimetableSchema } = require("./exam.validation");

const router = express.Router();

// View the timetable (same data as /exams, filtered/sorted for display)
router.get( "/", authenticate, examController.getTimetable );

// Run automatic timetable generation
router.post( "/generate", authenticate, authorize("ADMIN"), validate(generateTimetableSchema), examController.generateTimetable );

module.exports = router;
