const bcrypt = require("bcryptjs");
const User = require("../models/user");
const otpService = require("./otpService");
const tokenService = require("./tokenService");

exports.register = async ({ email, password}) => {
  // Validasi domain email UGM
  const isUGMMahasiswa = email.endsWith("@mail.ugm.ac.id");
  const isUGMAdmin = email.endsWith("@ugm.ac.id");
  
  if (!isUGMMahasiswa && !isUGMAdmin) {
    throw new Error("Registrasi hanya diperbolehkan untuk email dengan domain @mail.ugm.ac.id atau @ugm.ac.id");
  }

  // Validasi NIM jika ada
  if (nim) {
    const existingNim = await User.findOne({ nim });
    if (existingNim) {
      throw new Error("NIM sudah digunakan");
    }
  }

  // Cek apakah user sudah ada (pre-created by admin atau sudah register)
  let existing = await User.findOne({ email });
  
  if (existing) {
    // Jika sudah punya password, berarti sudah pernah register/claim
    if (existing.password && existing.isClaimed) {
      throw new Error("Email sudah terdaftar");
    }
    
    // Jika belum claimed (pre-created by admin), update dengan data user
    if (!existing.password || !existing.isClaimed) {
      const hashed = await bcrypt.hash(password, 10);
      
      // Update name jika provided (optional)
      if (name) existing.name = name;
      existing.password = hashed; // Set password
      existing.isClaimed = true; // Mark as claimed
      
      // Update nim dan prodi jika mahasiswa atau alumni dan provided
      if (["mahasiswa", "alumni"].includes(existing.role)) {
        if (nim) existing.nim = nim;
        if (prodi) existing.prodi = prodi;
      }
      
      // Generate OTP
      existing.otp = otpService.generateOTP();
      existing.otpExpiry = otpService.generateOTPExpiry();
      existing.isVerified = false;
      
      await existing.save();
      
      // Kirim email OTP
      const emailResult = await otpService.sendOTPEmail(email, existing.otp, "verification");
      if (!emailResult.success) {
        throw new Error("Gagal mengirim email OTP");
      }
      
      return { 
        email, 
        needVerification: true,
        message: "Akun berhasil diklaim. Cek email untuk OTP."
      };
    }
  }

  // Jika belum ada, buat user baru
  const hashed = await bcrypt.hash(password, 10);

  // Tentukan role berdasarkan domain
  let role = "guest";
  if (isUGMMahasiswa) role = "mahasiswa";
  else if (isUGMAdmin) role = "dosen"; // @ugm.ac.id = dosen

  const otp = otpService.generateOTP();
  const otpExpiry = otpService.generateOTPExpiry();

  const userData = {
    email,
    password: hashed,
    role,
    otp,
    otpExpiry,
    isVerified: false,
    isClaimed: true
  };

  // Tambahkan name jika provided (optional)
  if (name) userData.name = name;

  // Tambahkan nim dan prodi jika mahasiswa atau alumni dan provided
  if (["mahasiswa", "alumni"].includes(role)) {
    if (nim) userData.nim = nim;
    if (prodi) userData.prodi = prodi;
  }

  const user = new User(userData);
  await user.save();

  // Kirim email OTP
  const emailResult = await otpService.sendOTPEmail(email, otp, "verification");
  if (!emailResult.success) {
    await User.findByIdAndDelete(user._id);
    throw new Error("Gagal mengirim email OTP");
  }

  return { email, needVerification: true };
};

exports.verifyOTP = async ({ email, otp }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User tidak ditemukan");

  const check = otpService.verifyOTP(otp, user.otp, user.otpExpiry);
  if (!check.valid) throw new Error(check.message);

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  const tokenData = tokenService.generateUserToken(user);

  return { 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    token: tokenData.token,
    expiresIn: tokenData.expiresIn
  };
};

exports.login = async ({ email, password }) => {
  // Cari user di database
  const user = await User.findOne({ email });
  if (!user) throw new Error("Email tidak ditemukan");

  // Jika user sudah ada dan role-nya admin, izinkan login tanpa validasi domain
  const isExistingAdmin = user.role === 'admin';

  // Jika bukan admin, validasi domain email UGM
  if (!isExistingAdmin) {
    const isUGMMahasiswa = email.endsWith("@mail.ugm.ac.id");
    const isUGMAdmin = email.endsWith("@ugm.ac.id");
    
    if (!isUGMMahasiswa && !isUGMAdmin) {
      throw new Error("Login hanya diperbolehkan untuk email dengan domain @mail.ugm.ac.id atau @ugm.ac.id");
    }
  }

  // Jika user belum claimed (pre-created by admin tanpa password)
  if (!user.password || !user.isClaimed) {
    throw new Error("Akun belum diaktifkan. Silakan register terlebih dahulu untuk mengaktifkan akun.");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error("Password salah");

  const tokenData = tokenService.generateUserToken(user);

  return { 
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified
    },
    token: tokenData.token,
    expiresIn: tokenData.expiresIn
  };
};

exports.logout = async () => {
  // Simple logout - just clear cookie on client side
  return { message: "Logout berhasil" };
};
