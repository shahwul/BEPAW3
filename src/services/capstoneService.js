const Capstone = require("../models/capstone");
const User = require("../models/user");

exports.createCapstone = async ({ judul, kategori, ketua, anggota, dosen, abstrak, linkProposal }) => {
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

  const capstone = new Capstone({
    judul,
    kategori,
    ketua,
    anggota: anggota || [],
    dosen,
    abstrak,
    linkProposal
  });

  return await capstone.save();
};

exports.getAllCapstones = async (userId, userRole) => {
  const Request = require("../models/request");
  const Group = require("../models/group");

  const capstones = await Capstone.find()
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("dosen", "name email");

  // If admin, return all data including linkProposal
  if (userRole === "admin") {
    return capstones;
  }

  // For non-admin users, check which capstones they have access to
  const userGroups = await Group.find({
    anggota: userId
  }).select('_id');

  const userGroupIds = userGroups.map(g => g._id);

  const approvedRequests = await Request.find({
    group: { $in: userGroupIds },
    status: "Diterima"
  }).select('capstone');

  const accessibleCapstoneIds = approvedRequests.map(r => r.capstone.toString());

  // Filter out linkProposal for capstones user doesn't have access to
  const capstonesWithAccess = capstones.map(capstone => {
    const capstoneObj = capstone.toObject();
    
    const hasAccess = accessibleCapstoneIds.includes(capstoneObj._id.toString());
    
    if (!hasAccess) {
      delete capstoneObj.linkProposal;
    }
    
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

  // Admin always has access
  if (userRole === "admin") {
    hasAccessToProposal = true;
  } else {
    // Check if user is part of an approved group for this capstone
    const approvedRequest = await Request.findOne({
      capstone: id,
      status: "Diterima"
    }).populate("group");

    if (approvedRequest && approvedRequest.group) {
      // Check if user is member of the approved group
      const isMember = approvedRequest.group.anggota.some(
        memberId => memberId.toString() === userId.toString()
      );
      
      if (isMember) {
        hasAccessToProposal = true;
      }
    }
  }

  // Remove linkProposal if user doesn't have access
  if (!hasAccessToProposal) {
    delete capstoneObj.linkProposal;
  }

  return capstoneObj;
};

exports.updateCapstone = async (capstoneId, updateData) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Update basic fields if provided
  if (updateData.judul !== undefined) capstone.judul = updateData.judul;
  if (updateData.kategori !== undefined) capstone.kategori = updateData.kategori;
  if (updateData.abstrak !== undefined) capstone.abstrak = updateData.abstrak;
  if (updateData.status !== undefined) capstone.status = updateData.status;
  if (updateData.linkProposal !== undefined) capstone.linkProposal = updateData.linkProposal;

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
    
    // Filter by kategori (exact match)
    if (query.kategori) {
        filter.kategori = query.kategori;
    }
    
    // Filter by status (optional)
    if (query.status) {
        filter.status = query.status;
    }

    // Determine sort order
    let sortOption = {};
    if (query.sortBy === 'terbaru') {
        // Sort by creation date, newest first
        sortOption = { createdAt: -1 };
    } else if (query.sortBy === 'judul') {
        // Sort alphabetically by title (A-Z)
        sortOption = { judul: 1 };
    } else {
        // Default: sort by newest
        sortOption = { createdAt: -1 };
    }

    const capstones = await Capstone.find(filter)
      .sort(sortOption)
      .populate("ketua", "name email")
      .populate("anggota", "name email")
      .populate("dosen", "name email");

    // If admin, return all data including linkProposal
    if (userRole === "admin") {
        return capstones;
    }

    // For non-admin users, check which capstones they have access to
    // Get all approved requests for the user's groups
    const userGroups = await Group.find({
        anggota: userId
    }).select('_id');

    const userGroupIds = userGroups.map(g => g._id);

    const approvedRequests = await Request.find({
        group: { $in: userGroupIds },
        status: "Diterima"
    }).select('capstone');

    const accessibleCapstoneIds = approvedRequests.map(r => r.capstone.toString());

    // Filter out linkProposal for capstones user doesn't have access to
    const capstonesWithAccess = capstones.map(capstone => {
        const capstoneObj = capstone.toObject();
        
        // Check if user has access to this capstone's proposal
        const hasAccess = accessibleCapstoneIds.includes(capstoneObj._id.toString());
        
        if (!hasAccess) {
            delete capstoneObj.linkProposal;
        }
        
        return capstoneObj;
    });

    return capstonesWithAccess;
};

exports.deleteCapstone = async (capstoneId) => {
  const capstone = await Capstone.findById(capstoneId);
  if (!capstone) throw new Error("Capstone not found");

  // Delete capstone from database
  const deletedCapstone = await Capstone.findByIdAndDelete(capstoneId);
  return deletedCapstone;
};
