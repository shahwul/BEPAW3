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
      select: "judul kategori abstrak ketua"
    });

  if (!request) throw new Error("Request not found");
  if (!request.group) throw new Error("Group not found in request");
  if (!request.capstone) throw new Error("Capstone not found in request");

  // Validasi: Alumni hanya bisa review capstone milik mereka sendiri
  if (request.capstone.ketua.toString() !== alumniId) {
    throw new Error("You can only review applications for your own capstone");
  }

  // Update status request
  request.status = status;
  await request.save();

  // Update status capstone berdasarkan kondisi
  if (status === "Diterima") {
    // Jika diterima, capstone jadi "Tidak Tersedia"
    const capstone = await Capstone.findById(request.capstone);
    capstone.status = "Tidak Tersedia";
    await capstone.save();

    // Cari semua request lain yang masih menunggu review untuk capstone ini
    const otherPendingRequests = await Request.find({
      capstone: capstone._id,
      _id: { $ne: request._id },
      status: "Menunggu Review"
    }).populate({
      path: "group",
      populate: { path: "ketua", select: "_id name email" }
    });

    // Tolak semua request lain dan kirim notifikasi
    for (const otherRequest of otherPendingRequests) {
      otherRequest.status = "Ditolak";
      await otherRequest.save();

      // Kirim notifikasi ke ketua kelompok yang requestnya di-auto-reject
      if (otherRequest.group && otherRequest.group.ketua) {
        await notificationService.createNotification({
          userId: otherRequest.group.ketua._id,
          type: "capstone_tolak",
          message: `Request capstone "${capstone.judul}" ditolak karena sudah dipilih oleh kelompok lain.`,
          data: { 
            groupId: otherRequest.group._id, 
            capstoneId: capstone._id,
            status: "Ditolak",
            reason: "Auto-rejected: capstone already approved for another group"
          }
        });
      }
    }
  } else if (status === "Ditolak") {
    // Jika ditolak, cek apakah masih ada >= 3 pending request
    const pendingCount = await Request.countDocuments({
      capstone: request.capstone._id,
      status: "Menunggu Review"
    });
    
    // Jika pending request < 3, kembalikan status ke "Tersedia"
    if (pendingCount < 3) {
      await Capstone.findByIdAndUpdate(request.capstone._id, { status: "Tersedia" });
    }
  }

  // Kirim notifikasi ke ketua kelompok tentang hasil review
  await notificationService.createNotification({
    userId: request.group.ketua._id,
    type: status === "Diterima" ? "capstone_terima" : "capstone_tolak",
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
      select: "judul kategori abstrak"
    });
};

exports.getRequestsForAlumni = async (alumniId) => {
  // Cari semua capstone milik alumni ini (sebagai ketua)
  const alumniCapstones = await Capstone.find({ ketua: alumniId }).select('_id');
  const capstoneIds = alumniCapstones.map(c => c._id);

  // Cari semua request untuk capstone milik alumni (semua status)
  const requests = await Request.find({
    capstone: { $in: capstoneIds }
  })
    .populate({
      path: "group",
      populate: [
        { path: "ketua", select: "name email nim prodi" },
        { path: "anggota", select: "name email nim prodi" }
      ]
    })
    .populate("capstone", "judul kategori abstrak")
    .sort({ createdAt: -1 }); // Sort dari terbaru

  // Ambil group + request id + alasan + status
  return requests.map(req => ({
    requestId: req._id,
    group: req.group,
    capstone: req.capstone,
    alasan: req.alasan,
    status: req.status,
    createdAt: req.createdAt
  }));
};
