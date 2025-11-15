const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const apiKeyAuth = require("../middlewares/apiKey");

const router = express.Router();

// alumni get all requests for their capstones
router.get("/inbox", auth, role(["alumni"]), reviewController.getMyRequests);

// alumni submit review (auto-detect request by groupId)
router.post("/submit", auth, role(["alumni"]), reviewController.submitReview);

// admin: manual trigger auto-reject expired requests (dengan JWT)
router.post("/auto-reject", auth, role(["admin"]), reviewController.triggerAutoReject);

// cron job: auto-reject dengan API Key (tidak expire)
router.post("/cron/auto-reject", apiKeyAuth, reviewController.triggerAutoReject);

module.exports = router;
