const Group = require("../models/group");

exports.isKetua = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.ketua.toString() !== req.user.id) {
      return res.status(403).json({ message: "Only ketua can perform this action" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.isAnggota = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.anggota.map(a => a.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: "Not part of this group" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
