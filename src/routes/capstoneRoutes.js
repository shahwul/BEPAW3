const express = require("express");
const capstoneController = require("../controllers/capstoneController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const upload = require("../middlewares/upload");

const router = express.Router();

// Upload gambar hasil menggunakan multer (max 2 files dengan field name 'gambar')
router.post("/", auth, role(["admin"]), upload.array('gambar', 2), capstoneController.createCapstone);
router.get("/search", auth, capstoneController.searchCapstones);
router.get("/", auth, capstoneController.getAllCapstones);
router.get("/:id", auth, capstoneController.getCapstoneDetail);
router.put("/:id", auth, role(["admin"]), upload.array('gambar', 2), capstoneController.updateCapstone);
router.delete("/:id", auth, role(["admin"]), capstoneController.deleteCapstone);

module.exports = router;
