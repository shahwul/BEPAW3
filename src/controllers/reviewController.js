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
      // Ambil dosen info jika populated
      let dosen = group.dosen;
      let dosenInfo = {};
      if (dosen && typeof dosen === 'object') {
        dosenInfo = {
          id: dosen._id || dosen.id,
          name: dosen.name,
          nip: dosen.nip
        };
      }
      // Hitung remaining days (tiga hari setelah createdAt)
      let remainingDays = null;
      if (req.createdAt) {
        const created = new Date(req.createdAt);
        const now = new Date();
        const expire = new Date(created.getTime() + 3 * 24 * 60 * 60 * 1000);
        const diff = Math.ceil((expire - now) / (24 * 60 * 60 * 1000));
        remainingDays = diff > 0 ? diff : 0;
      }
      return {
        groupId: group._id || group.id,
        namaTim: group.namaTim,
        ketua: group.ketua,
        anggota: group.anggota,
        dosen: dosenInfo,
        alasan: req.alasan,
        linkcv: group.linkCVGabungan,
        createdAt: req.createdAt,
        status: req.status,
        remainingDays
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
