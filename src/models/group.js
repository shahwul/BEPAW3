const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  namaKelompok: String,
  ketua: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  anggota: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  capstoneDipilih: { type: mongoose.Schema.Types.ObjectId, ref: "Capstone" },
  status: { 
    type: String, 
    enum: ["Menunggu Persetujuan", "Disetujui", "Ditolak"], 
    default: "Menunggu Persetujuan" 
  }
});

module.exports = mongoose.model("Group", GroupSchema);
