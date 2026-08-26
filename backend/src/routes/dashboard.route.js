const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { getDashboardStats, getDirectory } = require("../controllers/dashboard.controller");
router.get("/dashboard-stats", protect, authorize("authority", "admin"), getDashboardStats);
router.get("/directory", protect, authorize("authority", "admin"), getDirectory);
module.exports = router;