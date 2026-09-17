const express = require("express");

const departmentController = require("./department.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");

const router = express.Router();

// List all departments
router.get( "/", authenticate, authorize("ADMIN"), departmentController.getAllDepartments );

// Add a department
router.post( "/", authenticate, authorize("ADMIN"), departmentController.addDepartment );

// Edit department
router.put( "/:id", authenticate, authorize("ADMIN"), departmentController.updateDepartment );

// Delete department
router.delete( "/:id", authenticate, authorize("ADMIN"), departmentController.deleteDepartment );

module.exports = router;
