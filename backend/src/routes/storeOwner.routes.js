const express = require("express");
const router = express.Router();
const {
  getDashboard,
  updatePassword,
} = require("../controllers/storeOwner.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");

router.get("/dashboard", verifyToken, authorizeRoles("store_owner"), getDashboard);
router.put("/password", verifyToken, authorizeRoles("store_owner"), updatePassword);

module.exports = router;