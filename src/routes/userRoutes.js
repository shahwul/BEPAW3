const express = require("express");
const { updateUserRole, getAllUsers, getUserById, deleteUser } = require("../controllers/userController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const router = express.Router();

// Admin only routes
router.patch("/:id/role", auth, role(["admin"]), updateUserRole);
router.get("/", auth, role(["admin"]), getAllUsers);
router.get("/:id", auth, role(["admin"]), getUserById);
router.delete("/:id", auth, role(["admin"]), deleteUser);


module.exports = router;
