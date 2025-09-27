const groupService = require("../services/groupService");
const notificationService = require("../services/notificationService");
const Group = require("../models/group");
const User = require("../models/user");
const Capstone = require("../models/capstone");
const Request = require("../models/request");

exports.createGroup = async (req, res) => {
  try {
    const { namaKelompok, ketua, anggota } = req.body;
    const ketuaUser = await User.findOne({ email: ketua });
    if (!ketuaUser) {
      return res.status(404).json({ message: "Ketua user not found" });
    }
    const ketuaId = ketuaUser._id;
    const group = await groupService.createGroup({ namaKelompok, ketua: ketuaId, anggota });
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

    const capstone = await Capstone.findById(capstoneId);
    if (!capstone) return res.status(404).json({ message: "Capstone not found" });

    // Hanya bisa memilih dengan status "Tersedia"
    if (capstone.status !== "Tersedia") {
      return res.status(400).json({ message: "Capstone is not available for selection." });
    }
    
    // Batasi satu group hanya bisa memilih dua capstone. Tidak ada double request.
    const existingRequest = await Request.findOne({ group: group._id, capstone: capstoneId });
    if (existingRequest) {
      return res.status(400).json({ message: "You have already requested this capstone." });
    }

    // Maksimal dua capstone yang dipilih dengan status pending atau accepted
    const requestCount = await Request.countDocuments({ 
      group: group._id, 
      status: { $in: ["Menunggu Review", "Diterima"] }
    });
    if (requestCount >= 2) {
      return res.status(400).json({ message: "You can only request up to two capstones." });
    }

    // Capstone dipilih maksimal tiga kali oleh kelompok berbeda
    const capstoneRequestCount = await Request.countDocuments({ 
      capstone: capstoneId,
      status: "Menunggu Review"
    });
    if (capstoneRequestCount >= 3) {
      return res.status(400).json({ message: "This capstone has already been requested by three different groups." });
    }

    const relation = new Request({
      group: group._id,
      capstone: capstoneId,
      status: "Menunggu Review"
    });
    await relation.save();

    const alumni = capstone.alumni; // Asumsikan capstone memiliki field alumni

    try {
      // Kirim notifikasi ke ketua kelompok
      await notificationService.createNotification({
      userId: group.ketua, // Asumsikan ketua adalah user yang menerima notifikasi
      type: "CAPSTONE_REQUEST",
      message: `Kelompok Anda telah memilih capstone dengan ID: ${capstoneId}. Silakan tinjau dan setujui.`,
      data: { groupId: group._id, capstoneId }
      });
    } catch (notifErr) {
      console.error("Failed to send notification to ketua:", notifErr);
    }

    try {
      // Kirim notifikasi ke alumni
      await notificationService.createNotification({
      userId: alumni, // Alumni yang menerima notifikasi
      type: "CAPSTONE_REQUEST",
      message: `Kelompok dengan ID: ${group._id} telah memilih capstone Anda. Silakan tinjau permintaan mereka.`,
      data: { groupId: group._id, capstoneId }
      });
    } catch (notifErr) {
      console.error("Failed to send notification to alumni:", notifErr);
    }

    res.json({ message: "Capstone chosen", group });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getGroupDetail = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate("ketua", "name email")
      .populate("anggota", "name email");

    if (!group) return res.status(404).json({ message: "Group not found" });

    // Ambil semua request capstone untuk group ini
    const requests = await Request.find({ group: group._id })
      .populate("capstone", "judul kategori");

    // Format data capstone yang dipilih beserta statusnya
    const capstoneDipilih = requests.map(req => ({
      capstone: req.capstone,
      status: req.status
    }));

    res.json({
      ...group.toObject(),
      capstoneDipilih
    });
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
