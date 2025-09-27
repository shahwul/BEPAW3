const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

router.post("/", auth, notificationController.createNotification);
router.get("/", auth, notificationController.getNotifications);
router.patch("/:id/read", auth, notificationController.markAsRead);

module.exports = router;
