const express = require("express");
const departmentRoutes = require("./department.routes");
 
const router = express.Router();
 
router.use("/departments", departmentRoutes);
 
module.exports = router;