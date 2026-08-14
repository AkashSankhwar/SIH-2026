const Incident = require("../models/Incident");

// POST /api/incidents/report
// Citizen reports a new incident. Status always starts as "reported" —
// it cannot be created as "verified" or anything else, that only happens
// through the verify/assign endpoints (authority-only).
const createIncident = async (req, res) => {
  try {
    const { title, description, type, severity, coordinates, address, state, district, mediaUrls } = req.body;

    // Basic validation — enough to stop garbage data, not exhaustive
    if (!title || !description || !type || !coordinates || !state || !district) {
      return res.status(400).json({
        success: false,
        message: "title, description, type, coordinates, state, and district are required",
      });
    }

    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({
        success: false,
        message: "coordinates must be an array of [longitude, latitude]",
      });
    }

    const incident = await Incident.create({
      title,
      description,
      type,
      severity: severity || "medium",
      status: "reported", // always starts here, never set by client input directly
      location: {
        type: "Point",
        coordinates,
      },
      address,
      state,
      district,
      mediaUrls: mediaUrls || [],
      // TODO: once auth is ready, replace this with req.user.id
      reportedBy: req.body.reportedBy || null,
    });

    res.status(201).json({ success: true, message: "Incident reported successfully", data: incident });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to report incident", error: err.message });
  }
};

module.exports = { createIncident };