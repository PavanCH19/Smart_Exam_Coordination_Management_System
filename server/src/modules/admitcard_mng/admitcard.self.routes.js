const express = require("express");

const admitcardController = require("./admitcard.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// The logged-in student's own admit card status
router.get( "/", authenticate, authorize("STUDENT"), admitcardController.getMyAdmitCard );

// The logged-in student's own admit card PDF
router.get( "/download", authenticate, authorize("STUDENT"), admitcardController.downloadMyAdmitCard );

module.exports = router;
