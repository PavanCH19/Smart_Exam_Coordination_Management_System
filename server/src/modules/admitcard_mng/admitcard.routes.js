const express = require("express");

const admitcardController = require("./admitcard.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { generateAdmitCardsSchema } = require("./admitcard.validation");

const router = express.Router();

// List admit card statuses (filterable by department/semester)
router.get( "/", authenticate, authorize("ADMIN"), admitcardController.getAdmitCards );

// Bulk-generate for a department/semester (or all pending if omitted)
router.post( "/generate", authenticate, authorize("ADMIN"), validate(generateAdmitCardsSchema), admitcardController.generateAdmitCards );

// Download a specific student's admit card PDF
router.get( "/:studentId/download", authenticate, authorize("ADMIN"), admitcardController.downloadAdmitCard );

module.exports = router;
