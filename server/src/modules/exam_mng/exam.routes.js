const express = require("express");

const examController = require("./exam.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const {
    createExamSchema,
    updateExamSchema
} = require("./exam.validation");

const router = express.Router();

// List exams
router.get( "/", authenticate, authorize("ADMIN", "STAFF"), examController.getAllExams );

// Create exam
router.post( "/", authenticate, authorize("ADMIN"), validate(createExamSchema), examController.addExam );

// Update exam
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateExamSchema), examController.updateExam );

// Delete exam
router.delete( "/:id", authenticate, authorize("ADMIN"), examController.deleteExam );

module.exports = router;
