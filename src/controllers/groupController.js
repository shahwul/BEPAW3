const groupService = require("../services/groupService");
const Group = require("../models/group");

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
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.capstoneDipilih = capstoneId;
    group.status = "Menunggu Persetujuan";
    await group.save();

    res.json({ message: "Capstone chosen", group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("ketua", "name email")
      .populate("anggota", "name email")
      .populate("capstoneDipilih", "judul kategori");

    if (!group) return res.status(404).json({ message: "Group not found" });
    res.json(group);
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
