const express = require("express");

const departmentController = require("./department.controller");

const authenticate = require("../../shared/middleware/authenticate");
const authorize = require("../../shared/middleware/authorize");
const validate = require("../../shared/middleware/validate");
const {
    createDepartmentSchema,
    updateDepartmentSchema
} = require("./department.validation");

const router = express.Router();

// List all departments — readable by any authenticated role, since Courses,
// Subjects, Exams, Timetable and Admit Card filters all populate their
// department dropdown from this endpoint regardless of who's logged in.
router.get( "/", authenticate, departmentController.getAllDepartments );

// Add a department
router.post( "/", authenticate, authorize("ADMIN"), validate(createDepartmentSchema), departmentController.addDepartment );

// Edit department
router.put( "/:id", authenticate, authorize("ADMIN"), validate(updateDepartmentSchema), departmentController.updateDepartment );

// Delete department
router.delete( "/:id", authenticate, authorize("ADMIN"), departmentController.deleteDepartment );

module.exports = router;
