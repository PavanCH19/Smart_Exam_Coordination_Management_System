const express = require("express");
const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const studentController = require("./students.controller");
const validate = require("../../shared/middleware/validate");
const {
    studentSchema
} = require("./students.validation")
const router = express.Router();

router.post("/", authenticate, authorize("ADMIN"), validate(studentSchema), studentController.addSingleStudent);

module.exports = router;