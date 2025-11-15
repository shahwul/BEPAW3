const reviewService = require("../services/reviewService");
const requestCleanupService = require("../services/requestCleanupService");
const { formatResponse } = require("../utils/responseFormatter");

exports.reviewGroup = async (req, res) => {
  try {
    const group = await reviewService.reviewGroup(
      req.params.id, 
      req.body.status, 
      req.user.id // Alumni ID
    );
    res.json({ 
      message: `Group ${req.body.status.toLowerCase()}`,
      group: formatResponse(group) 
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    const requests = await reviewService.getRequestsForAlumni(req.user.id);
    
    res.json({
      message: "All capstone requests for your projects",
      requests: formatResponse(requests),
      count: requests.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.triggerAutoReject = async (req, res) => {
  try {
    const result = await requestCleanupService.autoRejectExpiredRequests();
    res.json({
      message: "Auto-reject completed successfully",
      rejected: result.rejected,
      capstoneUpdated: result.capstoneUpdated
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  };

  exports.submitReview = async (req, res) => {
    try {
      const { groupId, status } = req.body;
    
      if (!groupId) {
        return res.status(400).json({ message: "groupId is required" });
      }
    
      const group = await reviewService.submitReview(
        req.user.id,
        groupId,
        status
      );
    
      res.json({ 
        message: `Group ${status.toLowerCase()}`,
        group: formatResponse(group) 
      });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
};
