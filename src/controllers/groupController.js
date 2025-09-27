const groupService = require("../services/groupService");

exports.createGroup = async (req, res) => {
  try {
    const { namaKelompok, ketua, anggota } = req.body;
    const group = await groupService.createGroup({ namaKelompok, ketua, anggota });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.chooseCapstone = async (req, res) => {
  try {
    const { capstoneId } = req.body;
    const relation = await groupService.chooseCapstone(req.params.id, capstoneId);
    res.json({ message: "Capstone chosen", relation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const detail = await groupService.getGroupDetail(req.params.id);
    res.json(detail);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
