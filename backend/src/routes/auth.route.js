const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth.middleware");

const { register, login } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, (req, res) => {
  res.json(req.user);
});
router.get(
  "/authority-only",
  protect,
  authorize("authority", "admin"),
  (req, res) => {
    res.json({ message: "Welcome authority!" });
  },
);

const { updateUserRole } = require("../controllers/auth.controller");

router.patch("/users/:userId/role", protect, authorize("admin"), updateUserRole);


module.exports = router;
