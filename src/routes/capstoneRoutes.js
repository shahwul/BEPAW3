const express = require("express");
const capstoneController = require("../controllers/capstoneController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");

const router = express.Router();

router.post("/", auth, role(["admin"]), capstoneController.createCapstone);
router.get("/search", auth, capstoneController.searchCapstones);
router.get("/", auth, capstoneController.getAllCapstones);
router.get("/:id", auth, capstoneController.getCapstoneDetail);
router.put("/:id", auth, role(["admin"]), capstoneController.updateCapstone);
router.delete("/:id", auth, role(["admin"]), capstoneController.deleteCapstone);

module.exports = router;
