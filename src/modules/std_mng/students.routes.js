const express = require("express");

const studentController = require("./students.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();


// List students
router.get( "/", authenticate, authorize("ADMIN"), studentController.getAllStudents );

// Search/filter students
router.get( "/search", authenticate, authorize("ADMIN"), studentController.getAllStudents );

// Bulk upload students
router.post( "/bulk-upload", authenticate, authorize("ADMIN"), studentController.bulkUploadStudents );

// Get student exams
router.get( "/:id/exams", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentExams );

// Get student attendance
router.get( "/:id/attendance", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentAttendance );

// Get student by ID
router.get( "/:id", authenticate, authorize("ADMIN", "STUDENT"), studentController.getStudentById );

// Add student
router.post( "/", authenticate, authorize("ADMIN"), studentController.addSingleStudent );

// Update student
router.put( "/:id", authenticate, authorize("ADMIN"), studentController.updateStudent );

// Delete/deactivate student
router.delete( "/:id", authenticate, authorize("ADMIN"), studentController.deleteStudent );

module.exports = router;