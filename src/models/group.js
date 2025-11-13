const mongoose = require("mongoose");

const GroupSchema = new mongoose.Schema({
  tema: { 
    type: String, 
    required: true 
  },
  namaTim: { 
    type: String, 
    required: true 
  },
  tahun: { 
    type: Number, 
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
        return arr.length > 0; // Minimal harus ada 1 anggota
      },
      message: 'Kelompok harus memiliki minimal 1 anggota'
    }
  },
  dosen: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  linkCVGabungan: { 
    type: String, 
    required: false 
  }
});

module.exports = mongoose.model("Group", GroupSchema);
