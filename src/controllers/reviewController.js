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


// Endpoint inbox: hanya mengembalikan data request dengan field grup yang diperlukan saja
exports.getInboxRequests = async (req, res) => {
  try {
    const requests = await reviewService.getRequestsForAlumni(req.user.id);
    // Format hanya field yang diperlukan
    const formatted = requests.map(req => {
      const group = req.group || {};
      return {
        namaTim: group.namaTim,
        ketua: group.ketua,
        anggota: group.anggota,
        dosen: group.dosen,
        alasan: req.alasan,
        linkcv: group.linkCVGabungan,
        createdAt: req.createdAt,
        status: req.status
      };
    });
    res.json({
      message: "Inbox requests",
      requests: formatted,
      count: formatted.length
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
