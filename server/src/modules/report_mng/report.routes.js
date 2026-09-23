const express = require("express");

const reportController = require("./report.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// type: exams | staff-duty | hall-utilization | attendance | issues | admit-cards
router.get( "/:type", authenticate, authorize("ADMIN"), reportController.getReport );
router.get( "/:type/export", authenticate, authorize("ADMIN"), reportController.exportReport );

module.exports = router;
