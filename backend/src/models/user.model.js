const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    address: {
      type: String,
      default: null,
    },
    refreshToken: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["citizen", "authority", "admin"],
      default: "citizen",
    },
    authorityLevel: {
      type: String,
      enum: ["state_admin", "district_admin", "field_responder", "department"],
      default: null, // sirf authority role wale users ke liye set hoga
    },
    jurisdictionState: {
      type: String,
      default: null, // State Admin/District Admin ke liye
    },
    jurisdictionDistrict: {
      type: String,
      default: null, // District Admin/Field Responder ke liye
    },
    departmentName: {
      type: String,
      default: null, // Department level users ke liye (jaise "Fire Department", "Medical")
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
