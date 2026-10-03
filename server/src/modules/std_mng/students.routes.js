const express = require("express");

const studentController = require("./students.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const uploadCsv = require("../../shared/middleware/uploadCsv");
const validate = require("../../shared/middleware/validate");
const {
    createStudentSchema,
    updateStudentSchema
} = require("./students.validation");

const router = express.Router();

// List students
router.get("/", authenticate, authorize("ADMIN"), studentController.getAllStudents);

// Search/filter students
router.get("/search", authenticate, authorize("ADMIN"), studentController.getAllStudents);

// Bulk upload students
// usn,name,email,phone,department,semester,section,course
router.post("/bulk-upload", authenticate, authorize("ADMIN"), uploadCsv, studentController.bulkUploadStudents);

// Get student exams
router.get("/:id/exams", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentExams);

// Get student attendance
router.get("/:id/attendance", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentAttendance);

// Get student by ID
// router.get("/:id", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentById);

// Add student
router.post( "/", authenticate, authorize("ADMIN"), validate(createStudentSchema), studentController.addSingleStudent );

// Update student
router.put( "/:usn", authenticate, authorize("ADMIN"), validate(updateStudentSchema), studentController.updateStudent );

// Delete/deactivate student
router.delete("/:usn", authenticate, authorize("ADMIN"), studentController.deleteStudent);

module.exports = router;