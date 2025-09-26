const Group = require("../models/group");
const Capstone = require("../models/capstone");

exports.reviewGroup = async (groupId, status, alumniId) => {
  const group = await Group.findById(groupId)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("capstoneDipilih", "judul kategori deskripsi alumni");

  if (!group) throw new Error("Group not found");
  if (!group.capstoneDipilih) throw new Error("Group has not selected a capstone");

  // Validasi: Alumni hanya bisa review capstone milik mereka sendiri
  if (group.capstoneDipilih.alumni.toString() !== alumniId) {
    throw new Error("You can only review applications for your own capstone");
  }

  group.status = status;
  await group.save();
  
  // Return group dengan data yang sudah ter-populate
  return await Group.findById(groupId)
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("capstoneDipilih", "judul kategori deskripsi");
};

exports.getPendingGroupsForAlumni = async (alumniId) => {
  // Cari semua capstone milik alumni ini
  const alumniCapstones = await Capstone.find({ alumni: alumniId }).select('_id');
  const capstoneIds = alumniCapstones.map(c => c._id);

  // Cari group yang memilih capstone alumni dan statusnya masih pending
  return await Group.find({
    capstoneDipilih: { $in: capstoneIds },
    status: "Menunggu Persetujuan"
  })
    .populate("ketua", "name email")
    .populate("anggota", "name email")
    .populate("capstoneDipilih", "judul kategori deskripsi");
};
