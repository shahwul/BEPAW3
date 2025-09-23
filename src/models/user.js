const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { 
    type: String, 
    required: function() { return !this.googleId; } 
  },
  googleId: { type: String },
  role: { 
    type: String, 
    enum: ["admin", "alumni", "mahasiswa", "guest"], 
    default: "guest" 
  },
  otp: { type: String },
  otpExpiry: { type: Date },
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("User", UserSchema);
