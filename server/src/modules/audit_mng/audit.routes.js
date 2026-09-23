const express = require("express");

const auditController = require("./audit.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// Read-only — entries are written automatically by other modules as a
// side effect of their own mutations, never created directly via this API.
router.get( "/", authenticate, authorize("ADMIN"), auditController.getAllLogs );

module.exports = router;
