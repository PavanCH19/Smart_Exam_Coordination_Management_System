const express = require("express");

const allocationController = require("./allocation.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { createAllocationSchema } = require("./allocation.validation");

// mergeParams so :examId from the parent mount path is visible here
const router = express.Router({ mergeParams: true });

// List room allocations for an exam
router.get( "/", authenticate, authorize("ADMIN", "STAFF"), allocationController.getAllocationsByExamId );

// Add a room allocation for an exam
router.post( "/", authenticate, authorize("ADMIN"), validate(createAllocationSchema), allocationController.addAllocation );

module.exports = router;
