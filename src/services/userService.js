const User = require("../models/user");

exports.updateUserRole = async (userId, role) => {
  if (!["admin", "alumni", "mahasiswa", "guest"].includes(role)) {
    throw new Error("Invalid role");
  }

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  user.role = role;
  await user.save();
  return user;
};

exports.getAllUsers = async () => {
  return User.find();
};

exports.getUserById = async (userId) => {
  return User.findById(userId);
};
