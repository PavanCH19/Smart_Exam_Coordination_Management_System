const express = require("express");

const notificationController = require("./notification.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { sendNotificationSchema } = require("./notification.validation");

const router = express.Router();

// Admin: notification history
router.get( "/", authenticate, authorize("ADMIN"), notificationController.getAllNotifications );

// Admin: send a notification
router.post( "/", authenticate, authorize("ADMIN"), validate(sendNotificationSchema), notificationController.sendNotification );

// Admin: retract a notification
router.delete( "/:id", authenticate, authorize("ADMIN"), notificationController.deleteNotification );

// Staff/Student: the logged-in user's own inbox
router.get( "/me", authenticate, authorize("STAFF", "STUDENT"), notificationController.getMyNotifications );

// Staff/Student: mark one as read
router.patch( "/:id/read", authenticate, authorize("STAFF", "STUDENT"), notificationController.markNotificationRead );

module.exports = router;
