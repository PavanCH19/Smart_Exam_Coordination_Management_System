const express = require("express");

const subjectController = require("./subject.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const {
    createSubjectSchema,
    updateSubjectSchema
} = require("./subject.validation");

const router = express.Router();

// List subjects — readable by any authenticated role (Exam creation and
// Timetable generation both need this dropdown regardless of caller's role).
router.get( "/", authenticate, subjectController.getAllSubjects );

// Add a subject
router.post( "/", authenticate, authorize("ADMIN"), validate(createSubjectSchema), subjectController.addSubject );

// Edit subject
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateSubjectSchema), subjectController.updateSubject );

// Delete subject
router.delete( "/:id", authenticate, authorize("ADMIN"), subjectController.deleteSubject );

module.exports = router;
