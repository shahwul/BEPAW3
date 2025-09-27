const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  namaKelompok: String,
  ketua: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  anggota: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Group", GroupSchema);
