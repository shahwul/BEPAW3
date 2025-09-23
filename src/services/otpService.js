const nodemailer = require('nodemailer');
const crypto = require('crypto');
require('dotenv').config();

class OTPService {
  constructor() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // atau smtp lainnya
      auth: {
        user: process.env.EMAIL_USER, // email pengirim
        pass: process.env.EMAIL_PASS  // password email atau app password
      }
    });
  }

  // Generate random 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Generate OTP expiry time (5 minutes from now)
  generateOTPExpiry() {
    return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
  }

  // Send OTP via email
  async sendOTPEmail(email, otp, type = 'verification') {
    const subject = type === 'verification' ? 'Kode Verifikasi OTP' : 'Kode Login OTP';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Kode ${subject}</h2>
        <p>Gunakan kode OTP berikut untuk ${type === 'verification' ? 'verifikasi akun' : 'login ke akun'} Anda:</p>
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${otp}</h1>
        </div>
        <p style="color: #666;">Kode ini akan kedaluwarsa dalam 5 menit.</p>
        <p style="color: #666;">Jika Anda tidak meminta kode ini, abaikan email ini.</p>
      </div>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: html
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log('OTP email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending OTP email:', error);
      return { success: false, error: error.message };
    }
  }

  // Verify OTP (check if OTP matches and not expired)
  verifyOTP(userOTP, storedOTP, otpExpiry) {
    if (!userOTP || !storedOTP || !otpExpiry) {
      return { valid: false, message: 'Data OTP tidak lengkap' };
    }

    if (new Date() > otpExpiry) {
      return { valid: false, message: 'Kode OTP sudah kedaluwarsa' };
    }

    if (userOTP !== storedOTP) {
      return { valid: false, message: 'Kode OTP tidak valid' };
    }

    return { valid: true, message: 'OTP berhasil diverifikasi' };
  }

  // Clean expired OTP (helper method)
  isOTPExpired(otpExpiry) {
    return new Date() > otpExpiry;
  }
}

module.exports = new OTPService();