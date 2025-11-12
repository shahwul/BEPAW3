const groupService = require("../services/groupService");

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
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.chooseCapstone = async (req, res) => {
  try {
    const { capstoneId, alasan } = req.body;
    const relation = await groupService.chooseCapstone(req.params.id, capstoneId, alasan);
    res.json({ message: "Capstone chosen", relation });
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
    const isAdmin = userRole === "admin";
    const isDosen = userRole === "dosen";
    
    if (!isAnggota && !isAdmin && !isDosen) {
      return res.status(403).json({ message: "Anda tidak memiliki akses ke grup ini" });
    }
    
    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  try {
    const group = await groupService.updateGroup(req.params.id, req.body);
    res.json({ message: "Group updated successfully", group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  try {
    const group = await groupService.deleteGroup(req.params.id);
    res.json({ message: "Group deleted", group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
