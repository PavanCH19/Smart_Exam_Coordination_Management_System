const express = require("express");
const multer = require("multer");

const studentController = require("./students.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const ApiError = require("../../shared/utils/ApiError");

const router = express.Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (file.mimetype !== "text/csv" && file.mimetype !== "application/vnd.ms-excel") {
			return callback(new ApiError(400, "Only CSV files are allowed"));
		}

		callback(null, true);
	}
});

const uploadCsv = (req, res, next) => {
	upload.single("file")(req, res, (error) => {
		if (error) {
			return next(new ApiError(400, error.message));
		}

		next();
	});
};

// List students
router.get( "/", authenticate, authorize("ADMIN"), studentController.getAllStudents );

// Search/filter students
router.get( "/search", authenticate, authorize("ADMIN"), studentController.getAllStudents );

// Bulk upload students
// usn,name,email,phone,department,semester,section,course
router.post( "/bulk-upload", authenticate, authorize("ADMIN"), uploadCsv, studentController.bulkUploadStudents );

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