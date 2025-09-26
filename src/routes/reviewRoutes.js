const express = require("express");
const reviewController = require("../controllers/reviewController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const router = express.Router();

// alumni get pending reviews for their capstones
router.get("/pending", auth, role(["alumni"]), reviewController.getPendingReviews);

// alumni review group
router.post("/:id", auth, role(["alumni"]), reviewController.reviewGroup);

module.exports = router;
