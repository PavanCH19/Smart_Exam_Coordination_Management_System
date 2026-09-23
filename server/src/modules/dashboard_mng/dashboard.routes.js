const express = require("express");

const dashboardController = require("./dashboard.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

router.get( "/admin/dashboard", authenticate, authorize("ADMIN"), dashboardController.getAdminDashboard );
router.get( "/staff/dashboard", authenticate, authorize("STAFF"), dashboardController.getStaffDashboard );
router.get( "/student/dashboard", authenticate, authorize("STUDENT"), dashboardController.getStudentDashboard );

module.exports = router;
