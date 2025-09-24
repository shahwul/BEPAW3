const express = require("express");
const multer = require("multer");
const capstoneController = require("../controllers/capstoneController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

// Configure multer to use memory storage - files will be stored in memory as Buffer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});
const router = express.Router();

router.post("/", auth, role(["alumni", "admin"]), upload.single("proposal"), capstoneController.createCapstone);
router.get("/", auth, capstoneController.getAllCapstones);
router.get("/:id", auth, capstoneController.getCapstoneDetail);
router.put("/:id", auth, role(["alumni", "admin"]), upload.single("proposal"), capstoneController.updateCapstone);
router.get("/:id/proposal", auth, role(["admin"]), capstoneController.getProposalLink);
router.get("/search", auth, capstoneController.searchCapstones);

module.exports = router;
