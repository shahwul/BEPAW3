const capstoneService = require("../services/capstoneService");

exports.createCapstone = async (req, res) => {
  try {
    const capstone = await capstoneService.createCapstone({
      ...req.body,
      alumni: req.user.id,
      file: req.file
    });
    res.status(201).json(capstone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllCapstones = async (req, res) => {
  try {
    const capstones = await capstoneService.getAllCapstones();
    res.json(capstones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCapstoneDetail = async (req, res) => {
  try {
    const capstone = await capstoneService.getCapstoneDetail(req.params.id);
    if (!capstone) return res.status(404).json({ message: "Capstone not found" });

    if (req.user.role !== "admin") {
      const { proposalUrl, proposalFileId, ...rest } = capstone.toObject();
      return res.json(rest);
    }

    res.json(capstone);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProposalLink = async (req, res) => {
  try {
    const url = await capstoneService.getProposalLinkForAdmin(req.params.id);
    res.json({ proposalUrl: url });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateCapstone = async (req, res) => {
  try {
    const capstoneId = req.params.id;
    
    // Check if capstone exists
    const existingCapstone = await capstoneService.getCapstoneDetail(capstoneId);
    if (!existingCapstone) {
      return res.status(404).json({ message: "Capstone not found" });
    }

    // Check authorization: only the owner (alumni) or admin can update
    if (req.user.role !== "admin" && existingCapstone.alumni._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this capstone" });
    }

    // Update capstone
    const updatedCapstone = await capstoneService.updateCapstone(
      capstoneId,
      req.body,
      req.file
    );

    res.json(updatedCapstone);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.searchCapstones = async (req, res) => {
  try {
    const capstones = await capstoneService.searchCapstones(req.query);
    res.json(capstones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCapstone = async (req, res) => {
  try {
    const capstoneId = req.params.id;
    
    // Check if capstone exists
    const existingCapstone = await capstoneService.getCapstoneDetail(capstoneId);
    if (!existingCapstone) {
      return res.status(404).json({ message: "Capstone not found" });
    }

    // Check authorization: only the owner (alumni) or admin can delete
    if (req.user.role !== "admin" && existingCapstone.alumni._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this capstone" });
    }

    // Delete capstone
    const deletedCapstone = await capstoneService.deleteCapstone(capstoneId);
    res.json({ message: "Capstone deleted successfully", capstone: deletedCapstone });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
