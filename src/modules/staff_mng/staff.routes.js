const express = require("express");

const staffController = require("./staff.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();


// List staff
router.get( "/", authenticate, authorize("ADMIN"), staffController.getAllStaff );

// Search/filter staff by department, designation, availability
router.get( "/search", authenticate, authorize("ADMIN"), staffController.searchStaff );

// Get number/list of assigned duties for a staff member
// Handled by the Duty/Roster module — mount its router there, e.g.:
// router.get( "/:id/workload", authenticate, authorize("ADMIN", "STAFF"), dutyController.getStaffWorkload );

// Get duty roster for a staff member
// Handled by the Duty/Roster module — mount its router there, e.g.:
// router.get( "/:id/duties", authenticate, authorize("ADMIN", "STAFF"), dutyController.getStaffDuties );

// Set/update staff availability
router.put( "/:id/availability", authenticate, authorize("ADMIN", "STAFF"), staffController.updateAvailability );

// Get staff details
router.get( "/:id", authenticate, authorize("ADMIN", "STAFF"), staffController.getStaffById );

// Add new staff member
router.post( "/", authenticate, authorize("ADMIN"), staffController.addStaff );

// Edit staff details
router.put( "/:id", authenticate, authorize("ADMIN"), staffController.updateStaff );

// Remove staff member
router.delete( "/:id", authenticate, authorize("ADMIN"), staffController.deleteStaff );

module.exports = router;
