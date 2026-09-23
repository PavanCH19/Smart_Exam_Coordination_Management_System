const express = require("express");

const allocationController = require("./allocation.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { updateAllocationSchema } = require("./allocation.validation");

const router = express.Router();

// Update a room allocation
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateAllocationSchema), allocationController.updateAllocation );

// Remove a room allocation
router.delete( "/:id", authenticate, authorize("ADMIN"), allocationController.deleteAllocation );

module.exports = router;
