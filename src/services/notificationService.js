const Notification = require("../models/notification");
const User = require("../models/user");
const nodemailer = require("nodemailer");
require("dotenv").config();

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async createNotification({ userId, type, message, data }) {
    const notification = new Notification({ userId, type, message, data });
    await notification.save();

    try {
      const user = await User.findById(userId);
      if (user && user.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: "Notifikasi Baru",
          text: message
        });
      }
    } catch (err) {
      console.error("Failed to send notification email:", err.message);
      // tidak melempar lagi supaya flow utama tidak gagal
    }

    return notification;
  }

  async getNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  }
}

module.exports = new NotificationService();
