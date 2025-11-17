// Get capstones where user is ketua or anggota
exports.getCapstonesByUser = async (userId) => {
  const Capstone = require("../models/capstone");
  return Capstone.find({
    $or: [
      { ketua: userId },
      { anggota: userId }
    ]
  })
    .populate("ketua", "name email nim")
    .populate("anggota", "name email nim")
    .populate("dosen", "name email nip");
};
const Capstone = require("../models/capstone");
const User = require("../models/user");
const cloudinaryService = require("./cloudinaryService");
const drive = require("../config/googleDrive");
const { Readable } = require("stream");

exports.createCapstone = async ({ judul, kategori, ketua, anggota, dosen, abstrak }, files = null) => {
  // Validasi ketua
  const ketuaUser = await User.findById(ketua);
  if (!ketuaUser) throw new Error("Ketua user not found");
  if (ketuaUser.role !== "alumni") {
    throw new Error("Ketua must have role 'alumni'");
  }

  // Validasi anggota (jika ada)
  if (anggota && anggota.length > 0) {
    const anggotaUsers = await User.find({ 
      _id: { $in: anggota }
    });
    
    if (anggotaUsers.length !== anggota.length) {
      throw new Error("Some anggota not found");
    }

    // Pastikan semua anggota adalah alumni
    const invalidAnggota = anggotaUsers.filter(u => u.role !== "alumni");
    if (invalidAnggota.length > 0) {
      throw new Error("All anggota must have role 'alumni'");
    }

    // Pastikan ketua TIDAK ada dalam array anggota
    if (anggota.includes(ketua)) {
      throw new Error("Ketua should not be included in anggota array");
    }
  }

  // Validasi dosen
  const dosenUser = await User.findById(dosen);
  if (!dosenUser) throw new Error("Dosen user not found");
  if (!["dosen", "admin"].includes(dosenUser.role)) {
    throw new Error("Dosen must have role 'dosen' or 'admin'");
  }

  const capstoneData = {
    judul,
    kategori,
    ketua,
    anggota: anggota || [],
    dosen,
    abstrak
  };

  // Upload proposal PDF to Google Drive (required)
  if (files && files.proposal) {
    try {
      // Convert buffer to stream
      const bufferStream = Readable.from(files.proposal.buffer);
      
      // Upload to Google Drive
      const fileMetadata = {
        name: `${judul}_proposal_${Date.now()}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: 'application/pdf',
        body: bufferStream
      };

      const driveFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      capstoneData.proposalFileId = driveFile.data.id;
      
      // Set permission to anyone with link can view
      await drive.permissions.create({
        fileId: driveFile.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        },
        supportsAllDrives: true
      });

      // Get shareable link
      const file = await drive.files.get({
        fileId: driveFile.data.id,
        fields: 'webViewLink',
        supportsAllDrives: true
      });

      capstoneData.proposalUrl = file.data.webViewLink;
    } catch (error) {
      throw new Error(`Gagal upload proposal ke Google Drive: ${error.message}`);
    }
  }

  // Upload gambar hasil jika ada files
  if (files && files.hasil && files.hasil.length > 0) {
    if (files.hasil.length > 2) {
      throw new Error("Maksimal 2 gambar hasil");
    }

    const uploadResult = await cloudinaryService.uploadMultipleImages(
      files.hasil,
      'capstone-hasil',
      2
    );

    if (!uploadResult.success) {
      throw new Error(`Gagal upload gambar: ${uploadResult.error}`);
    }

    capstoneData.hasil = uploadResult.urls;
  }

  const capstone = new Capstone(capstoneData);
  return await capstone.save();
};

exports.getAllCapstones = async (userId, userRole) => {
  const Request = require("../models/request");
  const Group = require("../models/group");

  const capstones = await Capstone.find()
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");

  // Find approved requests to determine which group has taken each capstone
  const capstoneIds = capstones.map(c => c._id);
  const approvedRequests = await Request.find({
    capstone: { $in: capstoneIds },
    status: "Diterima"
  }).populate({
    path: "group",
    select: "namaTim ketua anggota",
    populate: [
      { path: "ketua", select: "name email nim prodi" },
      { path: "anggota", select: "name email nim prodi" }
    ]
  });

  // Find pending requests (groups interested in the capstone)
  const pendingRequests = await Request.find({
    capstone: { $in: capstoneIds },
    status: "Menunggu Review"
  }).populate({
    path: "group",
    select: "namaTim ketua anggota",
    populate: [
      { path: "ketua", select: "name email nim prodi" },
      { path: "anggota", select: "name email nim prodi" }
    ]
  });

  const takenMap = {};
  approvedRequests.forEach(r => {
    if (r.group) takenMap[r.capstone.toString()] = r.group.toObject();
  });

  const pendingCountMap = {};
  pendingRequests.forEach(r => {
    const capstoneId = r.capstone.toString();
    pendingCountMap[capstoneId] = (pendingCountMap[capstoneId] || 0) + 1;
  });

  // If no user (public access), hide proposalUrl
  if (!userId || !userRole) {
    return capstones.map(capstone => {
      const capstoneObj = capstone.toObject();
      delete capstoneObj.proposalUrl;
      delete capstoneObj.proposalFileId;
      delete capstoneObj.linkProposal;
      capstoneObj.takenBy = takenMap[capstoneObj._id.toString()] || null;
      capstoneObj.pendingGroupsCount = pendingCountMap[capstoneObj._id.toString()] || 0;
      return capstoneObj;
    });
  }

  // If admin, return all data including proposalUrl
  if (userRole === "admin") {
    // For admin include who took the capstone and pending groups count
    return capstones.map(cap => {
      const obj = cap.toObject();
      obj.takenBy = takenMap[obj._id.toString()] || null;
      obj.pendingGroupsCount = pendingCountMap[obj._id.toString()] || 0;
      return obj;
    });
  }

  // For non-admin users, check which capstones they have access to
  // Find groups where user is ketua OR anggota
  const userGroups = await Group.find({
    $or: [
      { ketua: userId },
      { anggota: userId }
    ]
  }).select('_id');

  const userGroupIds = userGroups.map(g => g._id);

  const userGroupApprovedRequests = await Request.find({
    group: { $in: userGroupIds },
    status: "Diterima"
  }).select('capstone');

  const accessibleCapstoneIds = userGroupApprovedRequests.map(r => r.capstone.toString());

  // Filter out proposalUrl for capstones user doesn't have access to
  const capstonesWithAccess = capstones.map(capstone => {
    const capstoneObj = capstone.toObject();
    
    const hasAccess = accessibleCapstoneIds.includes(capstoneObj._id.toString());
    
    if (!hasAccess) {
      delete capstoneObj.proposalUrl;
      delete capstoneObj.proposalFileId;
      delete capstoneObj.linkProposal; // backward compatibility
    }

    capstoneObj.takenBy = takenMap[capstoneObj._id.toString()] || null;
    capstoneObj.pendingGroupsCount = pendingCountMap[capstoneObj._id.toString()] || 0;
    
    return capstoneObj;
  });

  return capstonesWithAccess;
};

exports.getCapstoneDetail = async (id, userId, userRole) => {
  const Request = require("../models/request");
  const Group = require("../models/group");

  const capstone = await Capstone.findById(id)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");

  if (!capstone) return null;

  // Convert to plain object to modify
  const capstoneObj = capstone.toObject();

  // Check if user has access to linkProposal
  let hasAccessToProposal = false;

  // If no user (public access), no access to proposal
  if (!userId || !userRole) {
    hasAccessToProposal = false;
  }
  // Admin always has access
  else if (userRole === "admin") {
    hasAccessToProposal = true;
  } else {
    // Check if user is part of an approved group for this capstone
    const approvedRequest = await Request.findOne({
      capstone: id,
      status: "Diterima"
    }).populate("group");

    if (approvedRequest && approvedRequest.group) {
      // Check if user is ketua or member of the approved group
      const isKetua = approvedRequest.group.ketua.toString() === userId.toString();
      const isMember = approvedRequest.group.anggota.some(
        memberId => memberId.toString() === userId.toString()
      );
      
      if (isKetua || isMember) {
        hasAccessToProposal = true;
      }
    }
  }

  // Remove proposalUrl if user doesn't have access
  if (!hasAccessToProposal) {
    delete capstoneObj.proposalUrl;
    delete capstoneObj.proposalFileId;
    delete capstoneObj.linkProposal; // backward compatibility
  }

  // Attach information about which group took this capstone (if any)
  const approvedRequestWithGroup = await Request.findOne({
    capstone: id,
    status: "Diterima"
  }).populate({
    path: "group",
    select: "namaTim ketua anggota",
    populate: [
      { path: "ketua", select: "name email nim prodi" },
      { path: "anggota", select: "name email nim prodi" }
    ]
  });

  // Attach pending groups (interested groups)
  const pendingRequestsForCapstone = await Request.find({
    capstone: id,
    status: "Menunggu Review"
  }).populate({
    path: "group",
    select: "namaTim ketua anggota",
    populate: [
      { path: "ketua", select: "name email nim prodi" },
      { path: "anggota", select: "name email nim prodi" }
    ]
  });

  capstoneObj.takenBy = approvedRequestWithGroup && approvedRequestWithGroup.group ? approvedRequestWithGroup.group.toObject() : null;
  capstoneObj.pendingGroupsCount = pendingRequestsForCapstone.length;

  return capstoneObj;
};

exports.updateCapstone = async (capstoneId, updateData, files = null) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Update basic fields if provided
  if (updateData.judul !== undefined) capstone.judul = updateData.judul;
  if (updateData.kategori !== undefined) capstone.kategori = updateData.kategori;
  if (updateData.abstrak !== undefined) capstone.abstrak = updateData.abstrak;
  if (updateData.status !== undefined) capstone.status = updateData.status;

  // Upload proposal PDF baru to Google Drive if provided
  if (files && files.proposal) {
    try {
      // Delete old proposal from Google Drive if exists
      if (capstone.proposalFileId) {
        await drive.files.delete({
          fileId: capstone.proposalFileId,
          supportsAllDrives: true
        });
      }

      // Convert buffer to stream
      const bufferStream = Readable.from(files.proposal.buffer);
      
      // Upload to Google Drive
      const fileMetadata = {
        name: `${updateData.judul || capstone.judul}_proposal_${Date.now()}.pdf`,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
      };

      const media = {
        mimeType: 'application/pdf',
        body: bufferStream
      };

      const driveFile = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink',
        supportsAllDrives: true
      });

      capstone.proposalFileId = driveFile.data.id;
      
      // Set permission to anyone with link can view
      await drive.permissions.create({
        fileId: driveFile.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone'
        },
        supportsAllDrives: true
      });

      // Get shareable link
      const file = await drive.files.get({
        fileId: driveFile.data.id,
        fields: 'webViewLink',
        supportsAllDrives: true
      });

      capstone.proposalUrl = file.data.webViewLink;
    } catch (error) {
      throw new Error(`Gagal upload proposal ke Google Drive: ${error.message}`);
    }
  }

  // Handle gambar hasil update
  if (files && files.hasil && files.hasil.length > 0) {
    if (files.hasil.length > 2) {
      throw new Error("Maksimal 2 gambar hasil");
    }

    // Delete old images from Cloudinary if exist
    if (capstone.hasil && capstone.hasil.length > 0) {
      const oldPublicIds = capstone.hasil
        .map(url => cloudinaryService.extractPublicId(url))
        .filter(id => id !== null);

      if (oldPublicIds.length > 0) {
        await cloudinaryService.deleteMultipleImages(oldPublicIds);
      }
    }

    // Upload new images
    const uploadResult = await cloudinaryService.uploadMultipleImages(
      files.hasil,
      'capstone-hasil',
      2
    );

    if (!uploadResult.success) {
      throw new Error(`Gagal upload gambar: ${uploadResult.error}`);
    }

    capstone.hasil = uploadResult.urls;
  }

  // Update ketua jika ada
  if (updateData.ketua !== undefined) {
    const ketuaUser = await User.findById(updateData.ketua);
    if (!ketuaUser) throw new Error("Ketua user not found");
    if (ketuaUser.role !== "alumni") {
      throw new Error("Ketua must have role 'alumni'");
    }
    capstone.ketua = updateData.ketua;
    
    // Pastikan ketua baru tidak ada di array anggota
    if (updateData.anggota === undefined) {
      // Remove new ketua from anggota if exists
      capstone.anggota = capstone.anggota.filter(
        id => id.toString() !== updateData.ketua.toString()
      );
    }
  }

  // Update anggota jika ada
  if (updateData.anggota !== undefined) {
    const anggotaUsers = await User.find({ 
      _id: { $in: updateData.anggota }
    });
    
    if (anggotaUsers.length !== updateData.anggota.length) {
      throw new Error("Some anggota not found");
    }

    const invalidAnggota = anggotaUsers.filter(u => u.role !== "alumni");
    if (invalidAnggota.length > 0) {
      throw new Error("All anggota must have role 'alumni'");
    }

    // Pastikan ketua tidak ada dalam array anggota
    const ketua = updateData.ketua || capstone.ketua;
    const ketuaInAnggota = updateData.anggota.some(
      id => id.toString() === ketua.toString()
    );
    
    if (ketuaInAnggota) {
      throw new Error("Ketua should not be included in anggota array");
    }

    capstone.anggota = updateData.anggota;
  }

  // Update dosen jika ada
  if (updateData.dosen !== undefined) {
    const dosenUser = await User.findById(updateData.dosen);
    if (!dosenUser) throw new Error("Dosen user not found");
    if (!["dosen", "admin"].includes(dosenUser.role)) {
      throw new Error("Dosen must have role 'dosen' or 'admin'");
    }
    capstone.dosen = updateData.dosen;
  }

  return await capstone.save();
};


exports.searchCapstones = async (query, userId, userRole) => {
    const Request = require("../models/request");
    const Group = require("../models/group");
    
    const filter = {};

    // Search by judul (case-insensitive, partial match)
    if (query.judul) {
        filter.judul = { $regex: query.judul, $options: 'i' };
    }
    
    // Filter by kategori (exact match - hanya: "Pengolahan Sampah", "Smart City", "Transportasi Ramah Lingkungan")
    if (query.kategori) {
        filter.kategori = query.kategori;
    }
    
    // Filter by status (exact match - hanya: "Tersedia", "Tidak Tersedia")
    if (query.status) {
        filter.status = query.status;
    }

    // Determine sort order
    let sortOption = {};

    const sortField =
      query.sortBy === "judul"
        ? "judul"
        : "createdAt"; // default field

    const sortOrder =
      query.order === "asc"
        ? 1
        : -1; // default newest

    sortOption = { [sortField]: sortOrder };


    const capstones = await Capstone.find(filter)
      .sort(sortOption)
      .populate("ketua", "name email")
      .populate("anggota", "name email")
      .populate("dosen", "name email");

    // Determine which capstones have been taken by a group (approved requests)
    const capstoneIds = capstones.map(c => c._id);
    const approvedRequests = await Request.find({
      capstone: { $in: capstoneIds },
      status: "Diterima"
    }).populate({
      path: "group",
      select: "namaTim ketua anggota",
      populate: [
        { path: "ketua", select: "name email nim prodi" },
        { path: "anggota", select: "name email nim prodi" }
      ]
    });

    // Find pending requests (groups interested in the capstone)
    const pendingRequests = await Request.find({
      capstone: { $in: capstoneIds },
      status: "Menunggu Review"
    }).populate({
      path: "group",
      select: "namaTim ketua anggota",
      populate: [
        { path: "ketua", select: "name email nim prodi" },
        { path: "anggota", select: "name email nim prodi" }
      ]
    });

    const takenMap = {};
    approvedRequests.forEach(r => {
      if (r.group) takenMap[r.capstone.toString()] = r.group.toObject();
    });

    const pendingCountMap = {};
    pendingRequests.forEach(r => {
      const capstoneId = r.capstone.toString();
      pendingCountMap[capstoneId] = (pendingCountMap[capstoneId] || 0) + 1;
    });

    // If no user (public access), hide proposalUrl
    if (!userId || !userRole) {
      return capstones.map(capstone => {
        const capstoneObj = capstone.toObject();
        delete capstoneObj.proposalUrl;
        delete capstoneObj.proposalFileId;
        delete capstoneObj.linkProposal;
        capstoneObj.takenBy = takenMap[capstoneObj._id.toString()] || null;
        capstoneObj.pendingGroupsCount = pendingCountMap[capstoneObj._id.toString()] || 0;
        return capstoneObj;
      });
    }

    // If admin, return all data including linkProposal
    if (userRole === "admin") {
      return capstones.map(cap => {
        const obj = cap.toObject();
        obj.takenBy = takenMap[obj._id.toString()] || null;
        obj.pendingGroupsCount = pendingCountMap[obj._id.toString()] || 0;
        return obj;
      });
    }

    // For non-admin users, check which capstones they have access to
    // Get all approved requests for the user's groups
    const userGroups = await Group.find({
        anggota: userId
    }).select('_id');

    const userGroupIds = userGroups.map(g => g._id);

    const userGroupApprovedRequests = await Request.find({
      group: { $in: userGroupIds },
      status: "Diterima"
    }).select('capstone');

    const accessibleCapstoneIds = userGroupApprovedRequests.map(r => r.capstone.toString());

    // Filter out proposalUrl for capstones user doesn't have access to
    const capstonesWithAccess = capstones.map(capstone => {
      const capstoneObj = capstone.toObject();
        
      // Check if user has access to this capstone's proposal
      const hasAccess = accessibleCapstoneIds.includes(capstoneObj._id.toString());
        
      if (!hasAccess) {
        delete capstoneObj.proposalUrl;
        delete capstoneObj.proposalFileId;
        delete capstoneObj.linkProposal; // backward compatibility
      }

      capstoneObj.takenBy = takenMap[capstoneObj._id.toString()] || null;
      capstoneObj.pendingGroupsCount = pendingCountMap[capstoneObj._id.toString()] || 0;
        
      return capstoneObj;
    });

    return capstonesWithAccess;
};

exports.deleteCapstone = async (capstoneId) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Delete proposal from Google Drive if exists
  if (capstone.proposalFileId) {
    try {
      await drive.files.delete({
        fileId: capstone.proposalFileId,
        supportsAllDrives: true
      });
    } catch (error) {
      console.error(`Error deleting file from Google Drive: ${error.message}`);
      // Continue with deletion even if Google Drive deletion fails
    }
  }

  // Delete gambar hasil from Cloudinary if exist
  if (capstone.hasil && capstone.hasil.length > 0) {
    const publicIds = capstone.hasil
      .map(url => cloudinaryService.extractPublicId(url))
      .filter(id => id !== null);

    if (publicIds.length > 0) {
      await cloudinaryService.deleteMultipleImages(publicIds);
    }
  }

  // Delete capstone from database
  const deletedCapstone = await Capstone.findByIdAndDelete(capstoneId);
  return deletedCapstone;
};

exports.getCapstoneRequestStats = async () => {
  const Request = require("../models/request");

  // Get total capstones
  const totalCapstones = await Capstone.countDocuments();
  const tersedia = await Capstone.countDocuments({ status: "Tersedia" });
  const tidakTersedia = await Capstone.countDocuments({ status: "Tidak Tersedia" });

  // Get pending request counts per capstone
  const pendingRequestCounts = await Request.aggregate([
    { $match: { status: "Menunggu Review" } },
    { $group: { _id: "$capstone", count: { $sum: 1 } } }
  ]);

  // Count capstones by request status
  let fullyRequested = 0;
  let noRequests = 0;
  
  const capstoneRequestMap = {};
  pendingRequestCounts.forEach(item => {
    capstoneRequestMap[item._id.toString()] = item.count;
    if (item.count >= 3) fullyRequested++;
  });

  // Get all capstone IDs to count those with no requests
  const allCapstoneIds = await Capstone.find().select('_id');
  allCapstoneIds.forEach(cap => {
    if (!capstoneRequestMap[cap._id.toString()]) {
      noRequests++;
    }
  });

  const partiallyRequested = totalCapstones - fullyRequested - noRequests;

  return {
    totalCapstones,
    tersedia,
    tidakTersedia,
    fullyRequested,
    noRequests,
    partiallyRequested
  };
};
