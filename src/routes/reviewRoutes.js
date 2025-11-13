const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const router = express.Router();

// alumni get all requests for their capstones
router.get("/my-requests", auth, role(["alumni"]), reviewController.getMyRequests);

// alumni review group
router.post("/:id", auth, role(["alumni"]), reviewController.reviewGroup);

// admin: manual trigger auto-reject expired requests
router.post("/auto-reject", auth, role(["admin"]), reviewController.triggerAutoReject);

module.exports = router;
