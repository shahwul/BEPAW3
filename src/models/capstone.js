const mongoose = require("mongoose");

const CapstoneSchema = new mongoose.Schema({
  judul: String,
  kategori: String,
  deskripsi: String,
  alumni: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { 
    type: String, 
    enum: ["Tersedia", "Dipilih"], 
    default: "Tersedia" 
  },
  proposalUrl: { type: String },      // hanya admin yang boleh akses
  proposalFileId: { type: String }    // ID file di Google Drive
});

module.exports = mongoose.model("Capstone", CapstoneSchema);
