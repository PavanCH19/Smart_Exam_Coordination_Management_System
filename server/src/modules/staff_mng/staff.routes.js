const express = require("express");

const staffController = require("./staff.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const {
    createStaffSchema,
    updateStaffSchema,
    updateAvailabilitySchema
} = require("./staff.validation");

const router = express.Router();


// List staff
router.get( "/", authenticate, authorize("ADMIN"), staffController.getAllStaff );

// Search/filter staff by department, designation, availability
router.get( "/search", authenticate, authorize("ADMIN"), staffController.searchStaff );

// Set/update staff availability
router.put( "/:id/availability", authenticate, authorize("ADMIN", "STAFF"), validate(updateAvailabilitySchema), staffController.updateAvailability );

// Get staff details
router.get( "/:id", authenticate, authorize("ADMIN", "STAFF"), staffController.getStaffById );

// Add new staff member
router.post( "/", authenticate, authorize("ADMIN"), validate(createStaffSchema), staffController.addStaff );

// Edit staff details
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateStaffSchema), staffController.updateStaff );

// Remove staff member
router.delete( "/:id", authenticate, authorize("ADMIN"), staffController.deleteStaff );

module.exports = router;
