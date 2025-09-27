const Group = require("../models/group");
const Capstone = require("../models/capstone");
const Request = require("../models/request");
const notificationService = require("../services/notificationService");

exports.reviewGroup = async (requestId, status, alumniId) => {
  const request = await Request.findById(requestId)
    .populate({
      path: "group",
      populate: [
        { path: "ketua", select: "name email" },
        { path: "anggota", select: "name email" }
      ]
    })
    .populate({
      path: "capstone",
      select: "judul kategori deskripsi alumni"
    });

  if (!request) throw new Error("Request not found");
  if (!request.group) throw new Error("Group not found in request");
  if (!request.capstone) throw new Error("Capstone not found in request");

  // Validasi: Alumni hanya bisa review capstone milik mereka sendiri
  if (request.capstone.alumni.toString() !== alumniId) {
    throw new Error("You can only review applications for your own capstone");
  }

  // Update status request
  request.status = status;
  await request.save();

  // Update status capstone jika diterima
  if (status === "Diterima") {
    const capstone = await Capstone.findById(request.capstone);
    capstone.status = "Dipilih";
    await capstone.save();

    // Tolak semua request lain yang masih menunggu review untuk capstone ini
    await Request.updateMany(
      {
        capstone: capstone._id,
        _id: { $ne: request._id },
        status: "Menunggu Review"
      },
      { status: "Ditolak" }
    );
  }

  // Kirim notifikasi ke ketua kelompok tentang hasil review
  await notificationService.createNotification({
    userId: request.group.ketua._id,
    type: "CAPSTONE_REVIEW",
    message: `Kelompok Anda telah direview dan statusnya: ${status}.`,
    data: { groupId: request.group._id, status }
  });

  // Return request dengan data yang sudah ter-populate
  return await Request.findById(requestId)
    .populate({
      path: "group",
      populate: [
        { path: "ketua", select: "name email" },
        { path: "anggota", select: "name email" }
      ]
    })
    .populate({
      path: "capstone",
      select: "judul kategori deskripsi"
    });
};

exports.getPendingGroupsForAlumni = async (alumniId) => {
  // Cari semua capstone milik alumni ini
  const alumniCapstones = await Capstone.find({ alumni: alumniId }).select('_id');
  const capstoneIds = alumniCapstones.map(c => c._id);

  // Cari semua request yang statusnya pending dan capstone milik alumni
  const requests = await Request.find({
    capstone: { $in: capstoneIds },
    status: "Menunggu Review"
  }).populate({
    path: "group",
    populate: [
      { path: "ketua", select: "name email" },
      { path: "anggota", select: "name email" }
    ]
  }).populate("capstone", "judul kategori deskripsi");

  // Ambil group dari request
  return requests.map(req => req.group);
};
