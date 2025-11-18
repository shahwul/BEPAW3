// Ambil semua grup
const groupService = require("../services/groupService");
const { formatResponse } = require("../utils/responseFormatter");

exports.getAllGroups = async (req, res) => {
  try {
    const groups = await groupService.getAllGroups(req.query);
    res.json( formatResponse({groups})  );
  } catch (err) {
    console.error("GetAllGroups Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { tema, namaTim, tahun, ketua, anggota, dosen, linkCVGabungan } = req.body;
    const group = await groupService.createGroup({ 
      tema, 
      namaTim, 
      tahun, 
      ketua, 
      anggota, 
      dosen, 
      linkCVGabungan
    });
    res.status(201).json(formatResponse(group));
  } catch (err) {
    res.status(400).json({ message: err.message });
    console.log(err);
  }
};

exports.chooseCapstone = async (req, res) => {
  try {
    const { capstoneId, alasan } = req.body;
    const relation = await groupService.chooseCapstoneByUser(req.user.id, capstoneId, alasan);
    res.json({ message: "Capstone chosen", relation: formatResponse(relation) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const detail = await groupService.getGroupDetail(req.params.id);

    // Cek akses: hanya anggota group, admin, atau dosen yang bisa lihat
    const isAnggota = detail.anggota.some(a => a._id.toString() === userId);
    const isKetua = detail.ketua._id.toString() === userId;
    const isAdmin = userRole === "admin";
    const isDosen = userRole === "dosen";
    
    if (!isAnggota && !isKetua && !isAdmin && !isDosen) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke grup ini" });
    }
    
    res.json(formatResponse(detail));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyGroupDetail = async (req, res) => {
  try {
    const detail = await groupService.getMyGroupDetail(req.user.id);
    res.json(formatResponse(detail));
  } catch (err) {
    if (err.message === "You are not part of any group yet") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await groupService.updateGroup(req.params.id, req.body);
    res.json({ message: "Group updated successfully", group: formatResponse(group) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await groupService.deleteGroup(req.params.id);
    res.json({ message: "Group deleted", group: formatResponse(group) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroupStats = async (req, res) => {
  try {
    const stats = await groupService.getGroupStats();
    res.json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.uploadCV = async (req, res) => {
  try {
    const { linkCVGabungan } = req.body;
    const group = await groupService.uploadCVByUser(req.user.id, linkCVGabungan);
    res.json({ 
      message: "CV gabungan uploaded successfully", 
      group: formatResponse(group)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reportIssue = async (req, res) => {
  try {
    const { description } = req.body;
    const group = await groupService.reportIssueByUser(req.user.id, description);
    res.json({ 
      message: "Issue reported successfully", 
      group: formatResponse(group)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getReportedGroups = async (req, res) => {
  try {
    const result = await groupService.getReportedGroups();
    res.json({
      total: result.total,
      groups: formatResponse(result.groups)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.resolveReportedIssue = async (req, res) => {
  try {
    const { groupId } = req.body;

    if (!groupId) {
      return res.status(400).json({ message: "groupId is required" });
    }

    const group = await groupService.resolveReportedIssue(groupId);

    res.json({
      message: "Issue resolved successfully",
      group: formatResponse(group)
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
exports.getMyRequests = async (req, res) => {
  try {
    const result = await groupService.getMyRequests(req.user.id);
    const formatted = {
      message: "Your capstone requests",
      group: formatResponse(result.group),
      requests: formatResponse(result.requests),
      count: result.count
    };
    res.json(formatted);
  } catch (err) {
    if (err.message === "You are not part of any group yet") {
      return res.status(404).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};
