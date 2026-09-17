const express = require("express");
const courseRoutes = require("./course.routes");
 
const router = express.Router();
 
router.use("/courses", courseRoutes);
 
module.exports = router;