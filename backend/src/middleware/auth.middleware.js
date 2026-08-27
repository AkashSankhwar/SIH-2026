const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

// Step 1: Verify token, attach user to request
exports.protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Step 2: Check role — usage: authorize("authority", "admin")
exports.authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient role" });
    }
    next();
  };
};
// Har request ke req.user se ek MongoDB filter banata hai, jurisdiction ke hisab se
exports.getJurisdictionFilter = (user) => {
  if (user.role === "admin") return {};   // admin sabkuch dekh sakta hai

  switch (user.authorityLevel) {
    case "state_admin":
      return { state: user.jurisdictionState };
    case "district_admin":
    case "field_responder":
      return { district: user.jurisdictionDistrict };
    default:
      return {};   // department ya kuch aur — abhi ke liye khula rakha, Phase 2 mein refine karenge
  }
};