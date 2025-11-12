const Group = require("../models/group");
const User = require("../models/user");
const Capstone = require("../models/capstone");
const Request = require("../models/request");
const notificationService = require("./notificationService");

exports.createGroup = async ({ tema, namaTim, tahun, ketua, anggota, dosen, linkCVGabungan }) => {
  // Validasi ketua berdasarkan ID
  const ketuaUser = await User.findById(ketua);
  if (!ketuaUser) throw new Error("Ketua user not found");
  
  // Validasi role ketua harus mahasiswa
  if (ketuaUser.role !== "mahasiswa") {
    throw new Error("Ketua must have role 'mahasiswa'");
  }

  // Validasi anggota berdasarkan ID (jika ada)
  if (anggota && anggota.length > 0) {
    const anggotaUsers = await User.find({ 
      _id: { $in: anggota },
      role: "mahasiswa"
    });
    
    if (anggotaUsers.length !== anggota.length) {
      throw new Error("Some anggota not found or don't have role 'mahasiswa'");
    }

    // Pastikan ketua TIDAK ada dalam array anggota
    if (anggota.includes(ketua)) {
      throw new Error("Ketua should not be included in anggota array");
    }
  }
  
  // Validasi maksimal 4 anggota total (ketua + anggota)
  const totalMembers = 1 + (anggota ? anggota.length : 0);
  if (totalMembers > 4) {
    throw new Error("Maximum 4 members per group (1 ketua + 3 anggota)");
  }

  // Validasi dosen
  const dosenUser = await User.findById(dosen);
  if (!dosenUser) throw new Error("Dosen user not found");
  
  // Validasi role dosen (bisa dosen atau admin)
  if (!["dosen", "admin"].includes(dosenUser.role)) {
    throw new Error("Dosen must have role 'dosen' or 'admin'");
  }

  const group = new Group({ 
    tema,
    namaTim, 
    tahun,
    ketua, 
    anggota: anggota || [],
    dosen,
    linkCVGabungan 
  });
  
  const savedGroup = await group.save();
  
  // Populate data untuk response
  return await Group.findById(savedGroup._id)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");
};

exports.chooseCapstone = async (groupId, capstoneId, alasan) => {
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
    alasan,
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
      userId: capstone.ketua,
      type: "capstone_request",
      message: `Kelompok dengan ID: ${group._id} telah memilih capstone Anda. Silakan tinjau permintaan mereka.`,
      data: { groupId: group._id, capstoneId }
    });
  } catch (notifErr) {
    console.error("Failed to send notification to alumni ketua:", notifErr);
  }

  return relation;
};

exports.getGroupDetail = async (groupId) => {
  const group = await Group.findById(groupId)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");

  if (!group) throw new Error("Group not found");

  const requests = await Request.find({ group: group._id })
    .populate("capstone", "judul kategori");

  const capstoneDipilih = requests.map(req => ({
    capstone: req.capstone,
    alasan: req.alasan,
    status: req.status,
    createdAt: req.createdAt
  }));

  return {
    ...group.toObject(),
    capstoneDipilih
  };
};

exports.updateGroup = async (groupId, updateData) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  // Update fields yang diizinkan
  if (updateData.tema !== undefined) group.tema = updateData.tema;
  if (updateData.namaTim !== undefined) group.namaTim = updateData.namaTim;
  if (updateData.tahun !== undefined) group.tahun = updateData.tahun;
  if (updateData.linkCVGabungan !== undefined) group.linkCVGabungan = updateData.linkCVGabungan;

  // Update ketua jika ada
  if (updateData.ketua !== undefined) {
    const ketuaUser = await User.findById(updateData.ketua);
    if (!ketuaUser) throw new Error("Ketua user not found");
    if (ketuaUser.role !== "mahasiswa") {
      throw new Error("Ketua must have role 'mahasiswa'");
    }
    group.ketua = updateData.ketua;
    
    // Pastikan ketua baru tidak ada di array anggota
    if (updateData.anggota === undefined) {
      // Remove new ketua from anggota if exists
      group.anggota = group.anggota.filter(
        id => id.toString() !== updateData.ketua.toString()
      );
    }
  }

  // Update anggota jika ada
  if (updateData.anggota !== undefined) {
    const anggotaUsers = await User.find({ 
      _id: { $in: updateData.anggota },
      role: "mahasiswa"
    });
    
    if (anggotaUsers.length !== updateData.anggota.length) {
      throw new Error("Some anggota not found or don't have role 'mahasiswa'");
    }

    const ketua = updateData.ketua || group.ketua;
    
    // Pastikan ketua tidak ada dalam array anggota
    const ketuaInAnggota = updateData.anggota.some(
      id => id.toString() === ketua.toString()
    );
    
    if (ketuaInAnggota) {
      throw new Error("Ketua should not be included in anggota array");
    }
    
    // Validasi maksimal 4 anggota total (ketua + anggota)
    const totalMembers = 1 + updateData.anggota.length;
    if (totalMembers > 4) {
      throw new Error("Maximum 4 members per group (1 ketua + 3 anggota)");
    }

    group.anggota = updateData.anggota;
  }

  // Update dosen jika ada
  if (updateData.dosen !== undefined) {
    const dosenUser = await User.findById(updateData.dosen);
    if (!dosenUser) throw new Error("Dosen user not found");
    if (!["dosen", "admin"].includes(dosenUser.role)) {
      throw new Error("Dosen must have role 'dosen' or 'admin'");
    }
    group.dosen = updateData.dosen;
  }

  await group.save();

  // Populate dan return
  return await Group.findById(group._id)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");
};

exports.deleteGroup = async (groupId) => {
  const group = await Group.findByIdAndDelete(groupId);
  if (!group) throw new Error("Group not found");
  return group;
};
