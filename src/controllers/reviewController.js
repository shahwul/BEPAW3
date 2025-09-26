const reviewService = require("../services/reviewService");

exports.reviewGroup = async (req, res) => {
  try {
    const group = await reviewService.reviewGroup(
      req.params.id, 
      req.body.status, 
      req.user.id // Alumni ID
    );
    res.json({ 
      message: `Group ${req.body.status.toLowerCase()}`, 
      group 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getPendingReviews = async (req, res) => {
  try {
    const pendingGroups = await reviewService.getPendingGroupsForAlumni(req.user.id);
    res.json({
      message: "Pending group reviews for your capstones",
      pendingGroups,
      count: pendingGroups.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
