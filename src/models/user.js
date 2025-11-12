const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { 
    type: String
    // Password optional - untuk pre-created users by admin
    // Will be set when user first registers
  },
  role: { 
    type: String, 
    enum: ["admin", "dosen", "alumni", "mahasiswa", "guest"], 
    default: "guest" 
  },
  // Mahasiswa-specific fields
  nim: { 
    type: String,
    sparse: true  // Allow null, but unique if provided
  },
  prodi: { 
    type: String
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false },
  isClaimed: { type: Boolean, default: false } // Track if user has claimed their account
});

module.exports = mongoose.model("User", UserSchema);
