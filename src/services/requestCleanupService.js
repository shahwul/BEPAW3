const Request = require("../models/request");
const Capstone = require("../models/capstone");
const notificationService = require("./notificationService");

/**
 * Auto-reject requests yang sudah lebih dari 3 hari (72 jam) tidak diproses
 */
exports.autoRejectExpiredRequests = async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 72 jam yang lalu
    
    console.log(`[AUTO-REJECT] Checking for requests older than ${threeDaysAgo.toISOString()}`);

    // Cari semua request yang:
    // 1. Status masih "Menunggu Review"
    // 2. Dibuat lebih dari 3 hari yang lalu
    const expiredRequests = await Request.find({
      status: "Menunggu Review",
      createdAt: { $lt: threeDaysAgo }
    }).populate({
      path: "group",
      populate: { path: "ketua", select: "name email" }
    }).populate("capstone", "judul");

    if (expiredRequests.length === 0) {
      console.log("[AUTO-REJECT] No expired requests found");
      return { rejected: 0, capstoneUpdated: [] };
    }

    console.log(`[AUTO-REJECT] Found ${expiredRequests.length} expired requests`);

    const capstoneIds = new Set();
    let rejectedCount = 0;

    // Update semua expired request menjadi "Ditolak"
    for (const request of expiredRequests) {
      request.status = "Ditolak";
      await request.save();
      rejectedCount++;

      capstoneIds.add(request.capstone._id.toString());

      // Kirim notifikasi ke ketua kelompok
      if (request.group && request.group.ketua) {
        await notificationService.createNotification({
          userId: request.group.ketua._id,
          type: "capstone_tolak",
          message: `Request capstone "${request.capstone.judul}" telah otomatis ditolak karena tidak diproses lebih dari 3 hari.`,
          data: { 
            groupId: request.group._id, 
            capstoneId: request.capstone._id,
            status: "Ditolak",
            reason: "Auto-rejected after 3 days"
          }
        });
      }
    }

    // Update status capstone jika pending request < 3
    const updatedCapstones = [];
    for (const capstoneId of capstoneIds) {
      const pendingCount = await Request.countDocuments({
        capstone: capstoneId,
        status: "Menunggu Review"
      });

      // Jika pending request < 3, kembalikan status ke "Tersedia"
      if (pendingCount < 3) {
        const capstone = await Capstone.findByIdAndUpdate(
          capstoneId,
          { status: "Tersedia" },
          { new: true }
        );
        
        if (capstone) {
          updatedCapstones.push(capstone.judul);
          console.log(`[AUTO-REJECT] Capstone "${capstone.judul}" status updated to "Tersedia"`);
        }
      }
    }

    console.log(`[AUTO-REJECT] Successfully rejected ${rejectedCount} requests`);
    console.log(`[AUTO-REJECT] Updated ${updatedCapstones.length} capstones to "Tersedia"`);

    return {
      rejected: rejectedCount,
      capstoneUpdated: updatedCapstones
    };
  } catch (error) {
    console.error("[AUTO-REJECT] Error:", error.message);
    throw error;
  }
};
