// Get single capstone where user is ketua or anggota (for alumni)
exports.getMyCapstones = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;
    if (role !== "alumni") {
      return res.status(403).json({ message: "Only alumni can access their capstones" });
    }
    const capstones = await require("../services/capstoneService").getCapstonesByUser(userId);
    if (!capstones || capstones.length === 0) {
      return res.status(404).json({ message: "No capstone found for this user" });
    }
    // Ambil capstone pertama (atau bisa pilih logika lain sesuai kebutuhan)
    let myCapstone = capstones[0].toObject();
    // Pastikan populate nim untuk ketua dan anggota
    if (myCapstone.ketua && myCapstone.ketua.nim) {
      myCapstone.ketuaNim = myCapstone.ketua.nim;
    }
    if (Array.isArray(myCapstone.anggota)) {
      myCapstone.anggotaNim = myCapstone.anggota.map(a => a.nim || null);
    }
    // Tampilkan nip dosen jika ada (nip = prodi atau field nip jika ada di model)
    if (myCapstone.dosen) {
      myCapstone.dosenNip = myCapstone.dosen.nip || myCapstone.dosen.prodi || null;
    }
    res.json(require("../utils/responseFormatter").formatResponse(myCapstone));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
const capstoneService = require("../services/capstoneService");
const { formatResponse } = require("../utils/responseFormatter");

exports.createCapstone = async (req, res) => {
  try {
    // req.files dari multer.fields() berisi object dengan key 'hasil' dan 'proposal'
    const files = {
      hasil: req.files?.hasil || [],  // Array of images
      proposal: req.files?.proposal ? req.files.proposal[0] : null  // Single PDF file
    };
    
    // Parse anggota jika dalam bentuk JSON string
    const body = { ...req.body };
    if (typeof body.anggota === 'string') {
      try {
        body.anggota = JSON.parse(body.anggota);
      } catch (e) {
        return res.status(400).json({ message: 'Format anggota tidak valid. Harus array JSON.' });
      }
    }
    
    const capstone = await capstoneService.createCapstone(body, files);
    res.status(201).json(capstone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCapstones = async (req, res) => {
  try {
    const capstones = await capstoneService.getAllCapstones(
      req.user?._id || null,
      req.user?.role || null
    );
    res.json(formatResponse(capstones));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCapstoneDetail = async (req, res) => {
  try {
    const capstone = await capstoneService.getCapstoneDetail(
      req.params.id,
      req.user?._id || null,
      req.user?.role || null
    );
    if (!capstone) return res.status(404).json({ message: "Capstone not found" });

    res.json(formatResponse(capstone));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateCapstone = async (req, res) => {
  try {
    const capstoneId = req.params.id;
    
    // Check if capstone exists (admin check, so pass admin role)
    const existingCapstone = await capstoneService.getCapstoneDetail(
      capstoneId,
      req.user._id,
      "admin"
    );
    if (!existingCapstone) {
      return res.status(404).json({ message: "Capstone not found" });
    }

    // Check authorization: only admin can update
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this capstone" });
    }

    // Update capstone (req.files dari multer.fields())
    const files = {
      hasil: req.files?.hasil || [],
      proposal: req.files?.proposal ? req.files.proposal[0] : null
    };
    
    // Parse anggota jika dalam bentuk JSON string
    const updateData = { ...req.body };
    if (typeof updateData.anggota === 'string') {
      try {
        updateData.anggota = JSON.parse(updateData.anggota);
      } catch (e) {
        return res.status(400).json({ message: 'Format anggota tidak valid. Harus array JSON.' });
      }
    }
    
    const updatedCapstone = await capstoneService.updateCapstone(
      capstoneId,
      updateData,
      files
    );

    res.json(formatResponse(updatedCapstone));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.searchCapstones = async (req, res) => {
  try {
    const capstones = await capstoneService.searchCapstones(
      req.query,
      req.user?._id || null,
      req.user?.role || null
    );
    res.json(formatResponse(capstones));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCapstone = async (req, res) => {
  try {
    const capstoneId = req.params.id;
    
    // Check if capstone exists (admin check, so pass admin role)
    const existingCapstone = await capstoneService.getCapstoneDetail(
      capstoneId,
      req.user._id,
      "admin"
    );
    if (!existingCapstone) {
      return res.status(404).json({ message: "Capstone not found" });
    }

    // Check authorization: only admin can delete
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this capstone" });
    }

    // Delete capstone
    const deletedCapstone = await capstoneService.deleteCapstone(capstoneId);
    res.json({ message: "Capstone deleted successfully", capstone: formatResponse(deletedCapstone) });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCapstoneStats = async (req, res) => {
  try {
    const stats = await capstoneService.getCapstoneRequestStats();
    res.json(formatResponse(stats));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
