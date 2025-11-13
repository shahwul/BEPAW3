const mongoose = require("mongoose");

const CapstoneSchema = new mongoose.Schema({
  judul: { 
    type: String, 
    required: true 
  },
  kategori: { 
    type: String, 
    required: true,
    enum: ["Pengolahan Sampah", "Smart City", "Transportasi Ramah Lingkungan"]
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
  hasil: {
    deskripsi: String,
    gambar: {
      type: [String],  // Array of image URLs from external storage (Cloudinary/Google Drive)
      validate: {
        validator: function(arr) {
          return arr.length <= 2;
        },
        message: 'Maksimal 2 gambar hasil'
      }
    }
  },
  status: { 
    type: String, 
    enum: ["Tersedia", "Tidak Tersedia"], 
    default: "Tersedia" 
  },
  linkProposal: { type: String }  // Link ke proposal (Google Drive, OneDrive, dll) - optional
});

module.exports = mongoose.model("Capstone", CapstoneSchema);
