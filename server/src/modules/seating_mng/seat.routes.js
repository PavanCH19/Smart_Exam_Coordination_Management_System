const express = require("express");

const seatController = require("./seat.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { generateSeatingSchema, saveSeatingSchema } = require("./seat.validation");

// mergeParams so :allocationId from the parent mount path is visible here
const router = express.Router({ mergeParams: true });

// Get the seating arrangement for a room allocation
router.get( "/", authenticate, authorize("ADMIN", "STAFF"), seatController.getSeating );

// Server-side generate (auto-fills from students matching the exam's dept/semester)
router.post( "/generate", authenticate, authorize("ADMIN"), validate(generateSeatingSchema), seatController.generateSeating );

// Save a manually built or client-computed seating list
router.post( "/", authenticate, authorize("ADMIN"), validate(saveSeatingSchema), seatController.saveSeating );

module.exports = router;
