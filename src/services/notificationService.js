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

  async createNotification({ userId, requestId, type, message, data }) {
    const notification = new Notification({ userId, requestId, type, message, data });
    await notification.save();

    try {
      const user = await User.findById(userId);
      if (user && user.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        // Generate HTML template berdasarkan type notifikasi
        const htmlTemplate = this.generateEmailTemplate(type, message, user.name || 'User', data);
        
        await this.transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: this.getEmailSubject(type),
          text: message, // fallback untuk email client yang tidak support HTML
          html: htmlTemplate
        });
      }
    } catch (err) {
      console.error("Failed to send notification email:", err.message);
      // tidak melempar lagi supaya flow utama tidak gagal
  }

  return notification;
}

// Method untuk generate subject berdasarkan type
getEmailSubject(type) {
  const subjects = {
    'capstone_request': '📋 Pengajuan Proposal Capstone Baru',
    'capstone_terima': '✅ Proposal Capstone Diterima',
    'capstone_tolak': '❌ Proposal Capstone Ditolak',
    'default': '📧 Notifikasi Capstone'
  };
  
  return subjects[type] || subjects.default;
}

// Method untuk generate HTML template
generateEmailTemplate(type, message, userName, data = {}) {
  const baseTemplate = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f5f7fa;
          line-height: 1.6;
          color: #333;
        }
        
        .email-container {
          max-width: 600px;
          margin: 20px auto;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 30px;
          text-align: center;
        }
        
        .header.request {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        .header.terima {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .header.tolak {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        }
        
        .header h1 {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 16px;
          opacity: 0.9;
        }
        
        .content {
          padding: 40px 30px;
        }
        
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
          color: #333;
        }
        
        .message-box {
          background: #f8fafc;
          border-left: 4px solid #4f46e5;
          padding: 20px;
          margin: 20px 0;
          border-radius: 4px;
        }
        
        .message-box.request {
          border-left-color: #3b82f6;
          background: #eff6ff;
        }
        
        .message-box.terima {
          border-left-color: #10b981;
          background: #ecfdf5;
        }
        
        .message-box.tolak {
          border-left-color: #ef4444;
          background: #fef2f2;
        }
        
        .message-text {
          font-size: 16px;
          line-height: 1.8;
        }
        
        .data-section {
          margin: 30px 0;
          padding: 20px;
          background: #fff;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }
        
        .data-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #495057;
        }
        
        .data-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f1f3f4;
        }
        
        .data-item:last-child {
          border-bottom: none;
        }
        
        .data-label {
          font-weight: 600;
          color: #6c757d;
        }
        
        .data-value {
          color: #333;
        }
        
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
          padding: 14px 28px;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
          text-align: center;
          transition: transform 0.2s ease;
        }
        
        .cta-button.request {
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
        }
        
        .cta-button.terima {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }
        
        .cta-button.tolak {
          background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
        }
        
        .cta-button:hover {
          transform: translateY(-2px);
        }
        
        .footer {
          background: #f8f9fa;
          padding: 30px;
          text-align: center;
          border-top: 1px solid #e9ecef;
        }
        
        .footer p {
          color: #6c757d;
          font-size: 14px;
          margin: 5px 0;
        }
        
        .social-links {
          margin: 20px 0;
        }
        
        .social-links a {
          display: inline-block;
          margin: 0 10px;
          color: #667eea;
          text-decoration: none;
        }
        
        @media (max-width: 600px) {
          .email-container {
            margin: 10px;
            border-radius: 8px;
          }
          
          .header, .content, .footer {
            padding: 20px;
          }
          
          .data-item {
            flex-direction: column;
            gap: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        {{HEADER}}
        
        <div class="content">
          <div class="greeting">
            Halo ${userName}! 👋
          </div>
          
          <div class="message-box">
            <div class="message-text">
              ${message}
            </div>
          </div>
          
          {{DATA_SECTION}}
          
          {{CTA_SECTION}}
        </div>
        
        <div class="footer">
          <p>Sistem Manajemen Capstone - Departemen Teknik Elektro dan Teknologi Informasi</p>
          <p>© ${new Date().getFullYear()} Universitas Gadjah Mada. All rights reserved.</p>
          <div class="social-links">
            <a href="#">Portal Mahasiswa</a> |
            <a href="#">Bantuan</a> |
            <a href="#">Kontak</a>
          </div>
          <p style="font-size: 12px; margin-top: 15px;">
            Email ini dikirim secara otomatis dari sistem capstone. 
            <a href="#" style="color: #4f46e5;">Ubah pengaturan notifikasi</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Customize berdasarkan type
  let customizedTemplate = baseTemplate;
  
  // Header customization
  const headers = {
    'capstone_request': {
      title: 'Pengajuan Proposal Capstone',
      subtitle: 'Ada proposal capstone baru yang menunggu review Anda',
      icon: '📋',
      class: 'request'
    },
    'capstone_terima': {
      title: 'Proposal Diterima!',
      subtitle: 'Selamat! Proposal capstone Anda telah disetujui',
      icon: '🎉',
      class: 'terima'
    },
    'capstone_tolak': {
      title: 'Proposal Perlu Perbaikan',
      subtitle: 'Proposal capstone Anda memerlukan revisi',
      icon: '📝',
      class: 'tolak'
    },
    'default': {
      title: 'Notifikasi Capstone',
      subtitle: 'Anda memiliki notifikasi baru',
      icon: '📧',
      class: ''
    }
  };

  const headerConfig = headers[type] || headers.default;
  
  const headerHtml = `
    <div class="header ${headerConfig.class}">
      <h1>${headerConfig.icon} ${headerConfig.title}</h1>
      <p>${headerConfig.subtitle}</p>
    </div>
  `;
  
  customizedTemplate = customizedTemplate.replace('{{HEADER}}', headerHtml);
  
  // Update message box class
  customizedTemplate = customizedTemplate.replace(
    'class="message-box"', 
    `class="message-box ${headerConfig.class}"`
  );
  
  // Data section (jika ada data tambahan)
  let dataSection = '';
  if (data && Object.keys(data).length > 0) {
    const dataItems = Object.entries(data)
      .map(([key, value]) => `
        <div class="data-item">
          <span class="data-label">${this.formatDataLabel(key)}:</span>
          <span class="data-value">${this.formatDataValue(value)}</span>
        </div>
      `).join('');
    
    dataSection = `
      <div class="data-section">
        <div class="data-title">Detail Informasi</div>
        ${dataItems}
      </div>
    `;
  }
  
  customizedTemplate = customizedTemplate.replace('{{DATA_SECTION}}', dataSection);
  
  // CTA section (call to action)
  let ctaSection = '';
  if (data && data.actionUrl) {
    const ctaClass = headerConfig.class;
    const defaultActions = {
      'capstone_request': 'Review Proposal',
      'capstone_terima': 'Lihat Detail Project',
      'capstone_tolak': 'Lihat Feedback'
    };
    
    ctaSection = `
      <div style="text-align: center;">
        <a href="${data.actionUrl}" class="cta-button ${ctaClass}">
          ${data.actionText || defaultActions[type] || 'Lihat Detail'}
        </a>
      </div>
    `;
  }
  
  customizedTemplate = customizedTemplate.replace('{{CTA_SECTION}}', ctaSection);
  
  return customizedTemplate;
}

// Helper method untuk format label data
formatDataLabel(key) {
  const labels = {
    'proposalId': 'ID Proposal',
    'proposalTitle': 'Judul Proposal',
    'studentName': 'Nama Mahasiswa',
    'studentNim': 'NIM',
    'alumniName': 'Alumni Pembimbing',
    'submissionDate': 'Tanggal Pengajuan',
    'reviewDate': 'Tanggal Review',
    'status': 'Status',
    'feedback': 'Catatan',
    'projectType': 'Jenis Project',
    'technology': 'Teknologi',
    'duration': 'Durasi Pengerjaan',
    'deadline': 'Batas Waktu'
  };
  
  return labels[key] || key.charAt(0).toUpperCase() + key.slice(1);
}

// Helper method untuk format value data
formatDataValue(value) {
  if (typeof value === 'number') {
    return value.toLocaleString('id-ID');
  }
  
  if (value instanceof Date) {
    return value.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  return value.toString();
}

  async getNotifications(userId) {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  }

  async markAsRead(notificationId) {
    return await Notification.findByIdAndUpdate(notificationId, { isRead: true }, { new: true });
  }
}

module.exports = new NotificationService();
