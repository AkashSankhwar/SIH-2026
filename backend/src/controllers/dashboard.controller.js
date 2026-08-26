const Incident = require("../models/incident.model");
const { getJurisdictionFilter } = require("../middleware/auth.middleware");

// @desc   Dashboard stats overview scoped to the authority's jurisdiction
// @route  GET /api/authority/dashboard-stats
const getDashboardStats = async (req, res) => {
  try {
    const jurisdictionFilter = getJurisdictionFilter(req.user);

    // Har status ke liye alag count nikalo, same jurisdiction filter ke saath
    const [pending, verified, assigned, resolved] = await Promise.all([
      Incident.countDocuments({ ...jurisdictionFilter, status: "reported" }),
      Incident.countDocuments({ ...jurisdictionFilter, status: "verified" }),
      Incident.countDocuments({ ...jurisdictionFilter, status: "assigned" }),
      Incident.countDocuments({ ...jurisdictionFilter, status: "resolved" }),
    ]);

    res.status(200).json({
      success: true,
      data: { pending, verified, assigned, resolved },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats", error: err.message });
  }
};

module.exports = { getDashboardStats };