const express = require("express");

const userController = require("./user.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const { createUserSchema, updateUserSchema } = require("./user.validation");

const router = express.Router();

// List user accounts (optional ?role= filter)
router.get( "/", authenticate, authorize("ADMIN"), userController.getAllUsers );

// Create a login account
router.post( "/", authenticate, authorize("ADMIN"), validate(createUserSchema), userController.addUser );

// Update a login account
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateUserSchema), userController.updateUser );

// Trigger a password reset (returns a temporary password — no email service is wired up yet)
router.post( "/:id/reset-password", authenticate, authorize("ADMIN"), userController.resetUserPassword );

// Deactivate/remove a login account
router.delete( "/:id", authenticate, authorize("ADMIN"), userController.deleteUser );

module.exports = router;
