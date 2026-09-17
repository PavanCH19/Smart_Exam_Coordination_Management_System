const express = require("express");

const courseController = require("./course.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// List all courses
router.get( "/", authenticate, authorize("ADMIN"), courseController.getAllCourses );

// Add a course
router.post( "/", authenticate, authorize("ADMIN"), courseController.addCourse );

// Edit course
router.put( "/:id", authenticate, authorize("ADMIN"), courseController.updateCourse );

// Delete course
router.delete( "/:id", authenticate, authorize("ADMIN"), courseController.deleteCourse );

module.exports = router;
