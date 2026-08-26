const Incident = require("../models/incident.model");
const User = require("../models/user.model");
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

// @desc   List available responders/departments, scoped to jurisdiction
// @route  GET /api/authority/directory?type=field_responder|department
const getDirectory = async (req, res) => {
  try {
    const { type } = req.query;

    const jurisdictionFilter = getJurisdictionFilter(req.user);

    // Incident model 'state'/'district' use karta hai, User model 'jurisdictionState'/'jurisdictionDistrict'
    // — isliye field names map karne padenge
    const userJurisdictionFilter = {};
    if (jurisdictionFilter.state) userJurisdictionFilter.jurisdictionState = jurisdictionFilter.state;
    if (jurisdictionFilter.district) userJurisdictionFilter.jurisdictionDistrict = jurisdictionFilter.district;

    const filter = {
      role: "authority",
      authorityLevel: { $in: ["field_responder", "department"] },
      ...userJurisdictionFilter,
    };

    if (type) filter.authorityLevel = type;

    const directory = await User.find(filter).select(
      "name email phone authorityLevel jurisdictionState jurisdictionDistrict departmentName"
    );

    res.status(200).json({ success: true, count: directory.length, data: directory });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch directory", error: err.message });
  }
};

module.exports = { getDashboardStats, getDirectory };
