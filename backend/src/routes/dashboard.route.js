const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");
const { getDashboardStats } = require("../controllers/dashboard.controller");

router.get("/dashboard-stats", protect, authorize("authority", "admin"), getDashboardStats);

module.exports = router;