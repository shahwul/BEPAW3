const express = require("express");
const groupController = require("../controllers/groupController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { isKetua, isAnggota } = require("../middlewares/groupAccess");

const router = express.Router();

// Admin only - write operations
router.post("/", auth, role(["admin"]), groupController.createGroup);
router.put("/:id", auth, role(["admin"]), groupController.updateGroup);
router.delete("/:id", auth, role(["admin"]), groupController.deleteGroup);

// ketua bisa pilih capstone
router.post("/:id/pilih", auth, role(["mahasiswa"]), isKetua, groupController.chooseCapstone);

// anggota grup + dosen bisa lihat detail
router.get("/:id", auth, groupController.getGroupDetail);

module.exports = router;
