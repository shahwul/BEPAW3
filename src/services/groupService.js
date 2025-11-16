const Group = require("../models/group");
const User = require("../models/user");
const Capstone = require("../models/capstone");
const Request = require("../models/request");
const notificationService = require("./notificationService");

exports.createGroup = async ({ tema, namaTim, tahun, ketua, anggota, dosen, linkCVGabungan}) => {
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
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");
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

  // Update status capstone jika sudah ada 3 pending request
  const pendingCount = await Request.countDocuments({
    capstone: capstoneId,
    status: "Menunggu Review"
  });
  
  if (pendingCount >= 3) {
    await Capstone.findByIdAndUpdate(capstoneId, { status: "Tidak Tersedia" });
  }

  // notifikasi
  try {
    await notificationService.createNotification({
      userId: group.ketua,
      requestId : relation._id,
      type: "notification",
      message: `Kelompok Anda telah memilih capstone dengan ID: ${capstoneId}. Silakan tinjau dan setujui.`,
      data: { groupId: group._id, capstoneId}
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

exports.chooseCapstoneByUser = async (userId, capstoneId, alasan) => {
  // Find group where user is ketua
  const group = await Group.findOne({ ketua: userId });
  if (!group) throw new Error("You are not a ketua of any group");

  // Call the existing chooseCapstone with the found group ID
  return exports.chooseCapstone(group._id, capstoneId, alasan);
};

exports.getGroupDetail = async (groupId) => {
  const group = await Group.findById(groupId)
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");
    // sertakan linkCVGabungan
    

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

exports.getMyGroupDetail = async (userId) => {
  // Find group where user is ketua or anggota
  const group = await Group.findOne({
    $or: [
      { ketua: userId },
      { anggota: userId }
    ]
  })
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");

  if (!group) throw new Error("You are not part of any group yet");

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
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");
};

exports.deleteGroup = async (groupId) => {
  const group = await Group.findByIdAndDelete(groupId);
  if (!group) throw new Error("Group not found");
  return group;
};

exports.uploadCV = async (groupId, userId, linkCVGabungan) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  // Validasi: hanya ketua yang bisa upload CV
  if (group.ketua.toString() !== userId) {
    throw new Error("Only ketua can upload CV gabungan");
  }

  // Validasi: linkCVGabungan harus ada
  if (!linkCVGabungan) {
    throw new Error("linkCVGabungan is required");
  }

  // Update link CV
  group.linkCVGabungan = linkCVGabungan;

  await group.save();

  // Populate dan return
  return await Group.findById(group._id)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");
};

exports.uploadCVByUser = async (userId, linkCVGabungan) => {
  // Find group where user is ketua
  const group = await Group.findOne({ ketua: userId });
  if (!group) throw new Error("You are not a ketua of any group");

  // Call the existing uploadCV with the found group ID
  return exports.uploadCV(group._id, userId, linkCVGabungan);
};

exports.reportIssue = async (groupId, userId, description) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  // Validasi: hanya ketua yang bisa report issue
  if (group.ketua.toString() !== userId) {
    throw new Error("Only ketua can report issues");
  }

  // Validasi: description harus ada
  if (!description || description.trim() === "") {
    throw new Error("Issue description is required");
  }

  // Update report issue
  group.reportIssue = {
    hasIssue: true,
    description,
    reportedAt: new Date()
  };

  await group.save();

  // Populate dan return
  return await Group.findById(group._id)
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");
};

exports.reportIssueByUser = async (userId, description) => {
  // Find group where user is ketua
  const group = await Group.findOne({ ketua: userId });
  if (!group) throw new Error("You are not a ketua of any group");

  // Call the existing reportIssue with the found group ID
  return exports.reportIssue(group._id, userId, description);
};

exports.getReportedGroups = async () => {
  // Get all groups yang ada reportIssue.hasIssue = true
  const reportedGroups = await Group.find({ "reportIssue.hasIssue": true })
    .select("namaTim reportIssue") // Hanya ambil field yang dibutuhkan
    .sort({ "reportIssue.reportedAt": -1 }); // Sort by newest report first

  return {
    total: reportedGroups.length,
    groups: reportedGroups.map(group => ({
      _id: group._id,
      namaTim: group.namaTim,
      reportIssue: {
        description: group.reportIssue.description,
        reportedAt: group.reportIssue.reportedAt
      }
    }))
  };
};

exports.resolveReportedIssue = async (groupId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new Error("Group not found");

  // Reset report issue
  group.reportIssue = {
    hasIssue: false,
    description: "",
    reportedAt: null
  };

  await group.save();

  // Return minimal data
  return {
    _id: group._id,
    namaTim: group.namaTim,
    reportIssue: group.reportIssue
  };
};

exports.getGroupStats = async () => {
  const totalGroups = await Group.countDocuments();
  
  // Groups by year
  const groupsByYear = await Group.aggregate([
    {
      $group: {
        _id: "$tahun",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);

  // Groups by member count
  const groupsBySize = await Group.aggregate([
    {
      $project: {
        memberCount: {
          $add: [
            1, // ketua
            { $size: { $ifNull: ["$anggota", []] } } // anggota
          ]
        }
      }
    },
    {
      $group: {
        _id: "$memberCount",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  // Groups with capstone requests
  const groupsWithRequests = await Request.distinct("group");
  const groupsWithRequestsCount = groupsWithRequests.length;
  const groupsWithoutRequests = totalGroups - groupsWithRequestsCount;

  // Request status breakdown
  const pendingRequests = await Request.countDocuments({ status: "Menunggu Review" });
  const approvedRequests = await Request.countDocuments({ status: "Diterima" });
  const rejectedRequests = await Request.countDocuments({ status: "Ditolak" });

  // Groups with approved capstones
  const groupsWithApprovedCapstone = await Request.distinct("group", { status: "Diterima" });
  const groupsWithApprovedCount = groupsWithApprovedCapstone.length;

  return {
    totalGroups,
    byYear: groupsByYear.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byMemberCount: groupsBySize.reduce((acc, item) => {
      acc[`${item._id} members`] = item.count;
      return acc;
    }, {}),
    capstoneRequests: {
      groupsWithRequests: groupsWithRequestsCount,
      groupsWithoutRequests,
      groupsWithApprovedCapstone: groupsWithApprovedCount
    },
    requestStatus: {
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      total: pendingRequests + approvedRequests + rejectedRequests
    }
  };
};

exports.getMyRequests = async (userId) => {
  // Find group where user is ketua or anggota
  const group = await Group.findOne({
    $or: [
      { ketua: userId },
      { anggota: userId }
    ]
  }).select('_id namaTim tema');

  if (!group) {
    throw new Error("You are not part of any group yet");
  }

  // Find all requests for this group
  const requests = await Request.find({ group: group._id })
    .populate({
      path: "capstone",
      select: "judul status createdAt proposalUrl proposalFileId"
    })
    .sort({ createdAt: -1 }); // Sort dari terbaru

  // Map requests dengan access control untuk proposalUrl
  const requestsWithAccess = requests.map(req => {
    const reqObj = req.toObject ? req.toObject() : req;
    const capstoneObj = req.capstone ? req.capstone.toObject() : null;
    
    if (capstoneObj) {
      // Hanya tampilkan proposalUrl jika request di-approve
      if (req.status !== "Diterima") {
        delete capstoneObj.proposalUrl;
        delete capstoneObj.proposalFileId;
      }
    }
    
    return {
      requestId: reqObj._id.toString(),
      capstone: capstoneObj,
      alasan: reqObj.alasan,
      status: reqObj.status,
      createdAt: reqObj.createdAt
    };
  });

  return {
    group: {
      _id: group._id,
      namaTim: group.namaTim,
      tema: group.tema
    },
    requests: requestsWithAccess,
    count: requestsWithAccess.length
  };
};
