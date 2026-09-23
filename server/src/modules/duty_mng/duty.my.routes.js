const express = require("express");

const dutyController = require("./duty.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// The logged-in staff member's own duties. Query: scope = today | week | all
router.get( "/", authenticate, authorize("STAFF"), dutyController.getMyDuties );

module.exports = router;
