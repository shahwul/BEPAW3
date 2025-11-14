const capstoneService = require("../services/capstoneService");

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
    res.json(capstones);
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

    res.json(capstone);
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

    res.json(updatedCapstone);
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
    res.json(capstones);
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
    res.json({ message: "Capstone deleted successfully", capstone: deletedCapstone });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getCapstoneStats = async (req, res) => {
  try {
    const stats = await capstoneService.getCapstoneRequestStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
