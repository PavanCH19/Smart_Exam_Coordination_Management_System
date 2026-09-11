const express = require("express");
const authController = require("./auth.controller");
const validate = require("../../shared/middleware/validate");
const authenticate = require("../../shared/middleware/authenticate");
const {
    loginSchema,
    changePasswordSchema
} = require("./auth.validation");

const router = express.Router();

router.post("/login", validate(loginSchema), authController.login);
router.post( "/change-password", authenticate, validate(changePasswordSchema), authController.changePassword );

module.exports = router;
