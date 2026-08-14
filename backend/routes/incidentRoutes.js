const express = require("express");
const router = express.Router();
const { createIncident } = require("../controllers/incidentController");

router.post("/report", createIncident);

module.exports = router;