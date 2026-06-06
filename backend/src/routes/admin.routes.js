const express = require("express");
const router = express.Router();
const {
  getDashboard,
  addUser,
  getUsers,
  getUserById,
  addStore,
  getStores,
} = require("../controllers/admin.controller");
const verifyToken = require("../middleware/auth.middleware");
const authorizeRoles = require("../middleware/role.middleware");


router.get("/dashboard", verifyToken, authorizeRoles("admin"), getDashboard);
router.post("/users", verifyToken, authorizeRoles("admin"), addUser);
router.get("/users", verifyToken, authorizeRoles("admin"), getUsers);
router.get("/users/:id", verifyToken, authorizeRoles("admin"), getUserById);
router.post("/stores", verifyToken, authorizeRoles("admin"), addStore);
router.get("/stores", verifyToken, authorizeRoles("admin"), getStores);

module.exports = router;


