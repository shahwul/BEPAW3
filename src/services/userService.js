const User = require("../models/user");

// Create pre-populated user (admin only - untuk bulk import mahasiswa/alumni)
exports.createPrePopulatedUser = async ({ email, role, name, nim, prodi }) => {
  // Validasi email domain
  const isUGMMahasiswa = email.endsWith("@mail.ugm.ac.id");
  const isUGMAdmin = email.endsWith("@ugm.ac.id");
  
  if (!isUGMMahasiswa && !isUGMAdmin) {
    throw new Error("Email harus menggunakan domain @mail.ugm.ac.id atau @ugm.ac.id");
  }

  // Validasi role sesuai domain
  if (isUGMMahasiswa && !["mahasiswa", "alumni"].includes(role)) {
    throw new Error("Email @mail.ugm.ac.id hanya bisa untuk role mahasiswa atau alumni");
  }
  if (isUGMAdmin && !["dosen", "admin"].includes(role)) {
    throw new Error("Email @ugm.ac.id hanya bisa untuk role dosen atau admin");
  }

  // Cek apakah email sudah ada
  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error("Email sudah ada di database");
  }

  // Validasi NIM jika ada
  if (nim) {
    const existingNim = await User.findOne({ nim });
    if (existingNim) {
      throw new Error("NIM sudah digunakan");
    }
  }

  // Buat user tanpa password (akan di-set saat user register)
  const userData = {
    email,
    role,
    name: name || null,
    password: null,
    isVerified: false,
    isClaimed: false
  };

  // Tambahkan nim dan prodi jika role mahasiswa atau alumni
  if (["mahasiswa", "alumni"].includes(role)) {
    if (nim) userData.nim = nim;
    if (prodi) userData.prodi = prodi;
  }

  const user = new User(userData);
  await user.save();
  return user;
};

// Bulk create users (untuk import dari CSV/Excel)
exports.bulkCreatePrePopulatedUsers = async (users) => {
  const results = {
    success: [],
    failed: []
  };

  for (const userData of users) {
    try {
      const user = await exports.createPrePopulatedUser(userData);
      results.success.push({ email: user.email, role: user.role });
    } catch (error) {
      results.failed.push({ 
        email: userData.email, 
        error: error.message 
      });
    }
  }

  return results;
};

exports.updateUser = async (userId, updateData) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Update role jika ada
  if (updateData.role !== undefined) {
    if (!["admin", "dosen", "alumni", "mahasiswa", "guest"].includes(updateData.role)) {
      throw new Error("Invalid role");
    }
    
    // Validasi role sesuai email domain
    const isUGMMahasiswa = user.email.endsWith("@mail.ugm.ac.id");
    const isUGMAdmin = user.email.endsWith("@ugm.ac.id");
    
    if (isUGMMahasiswa && !["mahasiswa", "alumni"].includes(updateData.role)) {
      throw new Error("Email @mail.ugm.ac.id hanya bisa untuk role mahasiswa atau alumni");
    }
    if (isUGMAdmin && !["dosen", "admin"].includes(updateData.role)) {
      throw new Error("Email @ugm.ac.id hanya bisa untuk role dosen atau admin");
    }
    
    user.role = updateData.role;
  }

  // Update name jika ada
  if (updateData.name !== undefined) {
    user.name = updateData.name;
  }

  // Update NIM jika ada (hanya untuk mahasiswa)
  if (updateData.nim !== undefined) {
    // Cek apakah NIM sudah dipakai user lain
    const existingNim = await User.findOne({ 
      nim: updateData.nim,
      _id: { $ne: userId }
    });
    if (existingNim) {
      throw new Error("NIM sudah digunakan oleh user lain");
    }
    user.nim = updateData.nim;
  }

  // Update prodi jika ada
  if (updateData.prodi !== undefined) {
    user.prodi = updateData.prodi;
  }

  // Update email jika ada
  if (updateData.email !== undefined) {
    // Validasi email domain baru
    const isUGMMahasiswa = updateData.email.endsWith("@mail.ugm.ac.id");
    const isUGMAdmin = updateData.email.endsWith("@ugm.ac.id");
    
    if (!isUGMMahasiswa && !isUGMAdmin) {
      throw new Error("Email harus menggunakan domain @mail.ugm.ac.id atau @ugm.ac.id");
    }

    // Cek apakah email baru sudah dipakai
    const existing = await User.findOne({ 
      email: updateData.email,
      _id: { $ne: userId }
    });
    if (existing) {
      throw new Error("Email sudah digunakan oleh user lain");
    }

    user.email = updateData.email;
  }

  // Update isVerified jika ada (admin only action)
  if (updateData.isVerified !== undefined) {
    user.isVerified = updateData.isVerified;
  }

  // Update isClaimed jika ada (admin only action)
  if (updateData.isClaimed !== undefined) {
    user.isClaimed = updateData.isClaimed;
  }

  await user.save();
  return user;
};

exports.getAllUsers = async (query) => {
  const filter = {};

  // ROLE (bisa multiple, contoh: ?role=mahasiswa,alumni)
  if (query.role) {
    filter.role = { $in: query.role.split(",") };
  }

  // PROGRAM STUDI (contoh: ?prodi=Teknologi Informasi)
  if (query.prodi) {
    filter.prodi = query.prodi;
  }

  // VERIFIKASI (boolean)
  if (query.isVerified !== undefined) {
    filter.isVerified = query.isVerified === "true";
  }

  // CLAIMED (boolean)
  if (query.isClaimed !== undefined) {
    filter.isClaimed = query.isClaimed === "true";
  }

  // SEARCH by name or email (optional)
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } }
    ];
  }

  const users = await User.find(filter).select("-password");
  return users;
};

exports.getUserById = async (userId) => {
  return User.findById(userId).select('-password');
};

exports.deleteUser = async (userId) => {
  return User.findByIdAndDelete(userId);
};

exports.getUserStats = async () => {
  const totalUsers = await User.countDocuments();
  
  // Count by role
  const admin = await User.countDocuments({ role: "admin" });
  const dosen = await User.countDocuments({ role: "dosen" });
  const alumni = await User.countDocuments({ role: "alumni" });
  const mahasiswa = await User.countDocuments({ role: "mahasiswa" });
  const guest = await User.countDocuments({ role: "guest" });
  
  // Count by verification status
  const verified = await User.countDocuments({ isVerified: true });
  const unverified = await User.countDocuments({ isVerified: false });
  
  // Count by claim status
  const claimed = await User.countDocuments({ isClaimed: true });
  const unclaimed = await User.countDocuments({ isClaimed: false });
  
  // Users with NIM (mahasiswa/alumni)
  const withNIM = await User.countDocuments({ nim: { $ne: null, $exists: true } });
  const withoutNIM = await User.countDocuments({ 
    $or: [
      { nim: null },
      { nim: { $exists: false } }
    ],
    role: { $in: ["mahasiswa", "alumni"] }
  });

  return {
    totalUsers,
    byRole: {
      admin,
      dosen,
      alumni,
      mahasiswa,
      guest
    },
    byVerification: {
      verified,
      unverified
    },
    byClaimStatus: {
      claimed,
      unclaimed
    },
    academicData: {
      withNIM,
      withoutNIM
    }
  };
};
