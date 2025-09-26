const express = require("express");
const groupController = require("../controllers/groupController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { isKetua, isAnggota } = require("../middlewares/groupAccess");

const router = express.Router();

// hanya admin bisa buat grup
router.post("/", auth, role(["admin"]), groupController.createGroup);

// hanya admin bisa hapus grup
router.delete("/:id", auth, role(["admin"]), groupController.deleteGroup);

// ketua bisa pilih capstone
router.post("/:id/pilih", auth, role(["mahasiswa"]), isKetua, groupController.chooseCapstone);

// semua anggota grup bisa lihat detail
router.get("/:id", auth, isAnggota, groupController.getGroupDetail);

module.exports = router;
