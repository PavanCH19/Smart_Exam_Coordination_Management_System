const express = require("express");

const issueController = require("./issue.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { createIssueSchema, updateIssueStatusSchema } = require("./issue.validation");

const router = express.Router();

// Admin: list/monitor issues (optional ?status= filter)
router.get( "/", authenticate, authorize("ADMIN"), issueController.getAllIssues );

// Admin: update issue status
router.patch( "/:id", authenticate, authorize("ADMIN"), validate(updateIssueStatusSchema), issueController.updateIssueStatus );

// Staff: report a new issue
router.post( "/", authenticate, authorize("STAFF"), validate(createIssueSchema), issueController.reportIssue );

// Staff: the logged-in staff member's own reported issues
router.get( "/me", authenticate, authorize("STAFF"), issueController.getMyIssues );

module.exports = router;
