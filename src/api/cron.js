export default async function handler(req, res) {
  console.log("Cron job executed at", new Date());

  console.log('[CRON] Running auto-reject expired requests job...');
  try {
    const result = await requestCleanupService.autoRejectExpiredRequests();
    console.log(`[CRON] Auto-reject completed: ${result.rejected} requests rejected, ${result.capstoneUpdated.length} capstones updated`);
  } catch (error) {
    console.error('[CRON] Auto-reject failed:', error.message);
  }

  return res.status(200).json({ message: "Cron ran successfully" });
}