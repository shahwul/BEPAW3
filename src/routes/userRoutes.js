const express = require("express");
const { 
  createPrePopulatedUser,
  bulkCreatePrePopulatedUsers,
  updateUser, 
  getAllUsers, 
  getUserById, 
  deleteUser 
} = require("../controllers/userController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const router = express.Router();

// Admin only routes - write operations
router.post("/", auth, role(["admin"]), createPrePopulatedUser); // Create pre-populated user
router.post("/bulk", auth, role(["admin"]), bulkCreatePrePopulatedUsers); // Bulk create
router.patch("/:id", auth, role(["admin"]), updateUser); // Update user (role, name, email, etc)
router.delete("/:id", auth, role(["admin"]), deleteUser);

// Admin & Dosen - read operations
router.get("/", auth, role(["admin", "dosen"]), getAllUsers);
router.get("/:id", auth, role(["admin", "dosen"]), getUserById);


module.exports = router;
