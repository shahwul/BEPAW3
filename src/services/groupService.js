const Group = require("../models/group");
const User = require("../models/user");
const Capstone = require("../models/capstone");
const Request = require("../models/request");
const notificationService = require("./notificationService");

exports.createGroup = async ({ namaKelompok, ketua, anggota }) => {
  const ketuaUser = await User.findOne({ email: ketua });
  if (!ketuaUser) throw new Error("Ketua user not found");

  const group = new Group({ 
    namaKelompok, 
    ketua: ketuaUser._id, 
    anggota: [ketuaUser._id, ...anggota] 
  });
  return await group.save();
};

exports.chooseCapstone = async (groupId, capstoneId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  if (capstone.status !== "Tersedia") {
    throw new Error("Capstone is not available for selection.");
  }

  const existingRequest = await Request.findOne({ 
    group: group._id, 
    capstone: capstoneId,
    status: { $ne: "Ditolak" }  // hanya blokir kalau bukan ditolak
  });

  if (existingRequest) {
    throw new Error("You have already requested this capstone.");
  }

  const requestCount = await Request.countDocuments({ 
    group: group._id, 
    status: { $in: ["Menunggu Review", "Diterima"] }
  });
  if (requestCount >= 2) throw new Error("You can only request up to two capstones.");

  const capstoneRequestCount = await Request.countDocuments({ 
    capstone: capstoneId,
    status: "Menunggu Review"
  });
  if (capstoneRequestCount >= 3) {
    throw new Error("This capstone has already been requested by three different groups.");
  }

  const relation = new Request({
    group: group._id,
    capstone: capstoneId,
    status: "Menunggu Review"
  });
  await relation.save();

  // notifikasi
  try {
    await notificationService.createNotification({
      userId: group.ketua,
      type: "notification",
      message: `Kelompok Anda telah memilih capstone dengan ID: ${capstoneId}. Silakan tinjau dan setujui.`,
      data: { groupId: group._id, capstoneId }
    });
  } catch (notifErr) {
    console.error("Failed to send notification to ketua:", notifErr);
  }

  try {
    await notificationService.createNotification({
      userId: capstone.alumni,
      type: "capstone_request",
      message: `Kelompok dengan ID: ${group._id} telah memilih capstone Anda. Silakan tinjau permintaan mereka.`,
      data: { groupId: group._id, capstoneId }
    });
  } catch (notifErr) {
    console.error("Failed to send notification to alumni:", notifErr);
  }

  return relation;
};

exports.getGroupDetail = async (groupId) => {
  const group = await Group.findById(groupId)
    .populate("ketua", "name email")
    .populate("anggota", "name email");

  if (!group) throw new Error("Group not found");

  const requests = await Request.find({ group: group._id })
    .populate("capstone", "judul kategori");

  const capstoneDipilih = requests.map(req => ({
    capstone: req.capstone,
    status: req.status
  }));

  return {
    ...group.toObject(),
    capstoneDipilih
  };
};

exports.deleteGroup = async (groupId) => {
  const group = await Group.findByIdAndDelete(groupId);
  if (!group) throw new Error("Group not found");
  return group;
};
