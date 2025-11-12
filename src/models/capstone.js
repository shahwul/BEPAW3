const mongoose = require("mongoose");

const CapstoneSchema = new mongoose.Schema({
  judul: { 
    type: String, 
    required: true 
  },
  kategori: { 
    type: String, 
    required: true 
  },
  ketua: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  anggota: { 
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    required: true,
    validate: {
      validator: function(arr) {
        return arr.length > 0;
      },
      message: 'Capstone harus memiliki minimal 1 anggota'
    }
  },
  dosen: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  abstrak: { 
    type: String, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ["Tersedia", "Dipilih"], 
    default: "Tersedia" 
  },
  linkProposal: { type: String }  // Link ke proposal (Google Drive, OneDrive, dll) - optional
});

module.exports = mongoose.model("Capstone", CapstoneSchema);
