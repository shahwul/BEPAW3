const Group = require("../models/group");

exports.createGroup = async ({ namaKelompok, ketua, anggota }) => {
  const group = new Group({ namaKelompok, ketua, anggota: [ketua, ...anggota] });
  return await group.save();
};

exports.deleteGroup = async (groupId) => {
  const group = await Group.findByIdAndDelete(groupId);
  if (!group) throw new Error("Group not found");
  return group;
};
