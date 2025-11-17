const express = require("express");
const groupController = require("../controllers/groupController");
const auth = require("../middlewares/auth");
const role = require("../middlewares/role");
const { isKetua, isAnggota } = require("../middlewares/groupAccess");

const router = express.Router();


// Ambil semua grup (admin-only, bisa diubah sesuai kebutuhan)
router.get("/", auth, role(["admin"]), groupController.getAllGroups);

// Admin only - write operations
router.post("/", auth, role(["admin"]), groupController.createGroup);
router.put("/:id", auth, role(["admin"]), groupController.updateGroup);
router.delete("/:id", auth, role(["admin"]), groupController.deleteGroup);

// ketua bisa pilih capstone (auto-detect group)
router.post("/pilih-capstone", auth, role(["mahasiswa"]), groupController.chooseCapstone);

// ketua bisa upload CV (auto-detect group)
router.patch("/upload-cv", auth, role(["mahasiswa"]), groupController.uploadCV);

// ketua bisa report issue (auto-detect group)
router.patch("/report-issue", auth, role(["mahasiswa"]), groupController.reportIssue);

// Admin - statistics
router.get("/stats", auth, role(["admin"]), groupController.getGroupStats);

// Admin - get reported groups
router.get("/reported", auth, role(["admin"]), groupController.getReportedGroups);

// Admin - resolve reported issue
router.patch("/:id/resolve-issue", auth, role(["admin"]), groupController.resolveReportedIssue);

// Mahasiswa - get my group's capstone requests
router.get("/my-requests", auth, role(["mahasiswa"]), groupController.getMyRequests);

// Mahasiswa - get my group detail (auto-detect based on current user)
router.get("/my-group", auth, role(["mahasiswa"]), groupController.getMyGroupDetail);

// anggota grup + dosen bisa lihat detail
router.get("/:id", auth, groupController.getGroupDetail);

module.exports = router;
