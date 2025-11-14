const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const apiKeyAuth = require("../middlewares/apiKey");

const router = express.Router();

// alumni get all requests for their capstones
router.get("/my-requests", auth, role(["alumni"]), reviewController.getMyRequests);

// alumni review group
router.post("/:id", auth, role(["alumni"]), reviewController.reviewGroup);

// admin: manual trigger auto-reject expired requests (dengan JWT)
router.post("/auto-reject", auth, role(["admin"]), reviewController.triggerAutoReject);

// cron job: auto-reject dengan API Key (tidak expire)
router.post("/cron/auto-reject", apiKeyAuth, reviewController.triggerAutoReject);

module.exports = router;
