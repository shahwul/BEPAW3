const capstoneService = require("../services/capstoneService");

exports.createCapstone = async (req, res) => {
  try {
    // req.files akan berisi array gambar jika di-upload
    const capstone = await capstoneService.createCapstone(req.body, req.files);
    res.status(201).json(capstone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCapstones = async (req, res) => {
  try {
    const capstones = await capstoneService.getAllCapstones(
      req.user._id,
      req.user.role
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
      req.user._id,
      req.user.role
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

    // Update capstone (req.files untuk upload gambar baru)
    const updatedCapstone = await capstoneService.updateCapstone(
      capstoneId,
      req.body,
      req.files
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
      req.user._id,
      req.user.role
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
