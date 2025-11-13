const userService = require("../services/userService");

// Create pre-populated user (admin creates user with just email + role)
const createPrePopulatedUser = async (req, res) => {
  try {
    const user = await userService.createPrePopulatedUser(req.body);
    
    const response = { 
      message: "User pre-created successfully. User can now register to claim this account.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isClaimed: user.isClaimed
      }
    };

    // Include nim and prodi if mahasiswa or alumni
    if (["mahasiswa", "alumni"].includes(user.role)) {
      if (user.nim) response.user.nim = user.nim;
      if (user.prodi) response.user.prodi = user.prodi;
    }

    res.status(201).json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Bulk create users (untuk import CSV/Excel)
const bulkCreatePrePopulatedUsers = async (req, res) => {
  try {
    const { users } = req.body; // Array of { email, role, name? }
    
    if (!Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ message: "Users array is required" });
    }

    const results = await userService.bulkCreatePrePopulatedUsers(users);
    
    res.status(201).json({
      message: "Bulk user creation completed",
      summary: {
        total: users.length,
        success: results.success.length,
        failed: results.failed.length
      },
      results
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    
    const response = { 
      message: "User updated successfully", 
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        isClaimed: user.isClaimed
      }
    };

    // Include nim and prodi if mahasiswa or alumni
    if (["mahasiswa", "alumni"].includes(user.role)) {
      if (user.nim) response.user.nim = user.nim;
      if (user.prodi) response.user.prodi = user.prodi;
    }

    res.json(response);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted", user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getUserStats = async (req, res) => {
  try {
    const stats = await userService.getUserStats();
    res.json(stats);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { 
  createPrePopulatedUser,
  bulkCreatePrePopulatedUsers,
  updateUser, 
  getAllUsers, 
  getUserById, 
  deleteUser,
  getUserStats
};
