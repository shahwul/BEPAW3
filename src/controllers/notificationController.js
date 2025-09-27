const NotificationService = require("../services/notificationService");

exports.createNotification = async (req, res) => {
  try {
    const { userId, type, message, data } = req.body;
    const notification = await NotificationService.createNotification({ userId, type, message, data });
    res.status(201).json(notification);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getNotifications(req.user._id);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const notif = await NotificationService.markAsRead(req.params.id);
    res.json(notif);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
