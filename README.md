# 🎓 CapCon - Capstone Container

## 📖 Deskripsi Aplikasi

**CapCon (Capstone Container)** adalah aplikasi web yang berfungsi sebagai wadah terpusat untuk memfasilitasi alur informasi dan koordinasi antara **Mahasiswa**, **Alumni**, **Dosen**, dan **Admin** dalam pelaksanaan program capstone.

### Fitur Utama per Role

- **👨‍🎓 Mahasiswa**
  - Menelusuri daftar capstone project yang pernah dikerjakan alumni
  - Mengajukan permintaan untuk melanjutkan project dengan proposal tim
  - Mengelola grup dan anggota tim capstone

- **👨‍💼 Alumni**
  - Meninjau dan memberikan keputusan terhadap permintaan kelanjutan project
  - Approve atau reject proposal dari mahasiswa
  - Melihat notifikasi permintaan project

- **👨‍🏫 Dosen**
  - Melihat dan mengelola data user
  - Monitoring capstone projects dan grup mahasiswa
  - Memfasilitasi koordinasi antara mahasiswa dan alumni

- **⚙️ Admin**
  - Mengelola data pengguna, project, dan grup
  - Membuat pre-populated user untuk batch import
  - Monitoring statistik capstone dan request
  - Full access ke semua fitur sistem

**Tujuan utama** CapCon adalah menciptakan sistem informasi capstone yang lebih terintegrasi, transparan, dan efisien, sehingga mendorong keberlanjutan inovasi penelitian mahasiswa di Departemen Teknik Elektro dan Teknologi Informasi (DTETI) UGM.

---

## 👥 Nama Kelompok & Anggota

**Kelompok:** PAW 3

- Hanifah Putri Ariani (22/504042/TK/55111) - Ketua
- Navika Berlianda Rihadatul'aisya (22/505243/TK/55277)
- Raudha Nur Hidayatullah Susanto (22/500044/TK/54789)
- Muhammad Haidar Syaafi' (23/521614/TK/57545)
- Syahrul Afif Tri Anggara (23/518266/TK/57027)

---

## 📁 Struktur Folder & File

Struktur project (disederhanakan):

```plaintext
/ (root)
├── .env                      # Environment variables (JANGAN commit!)
├── .gitignore                # Ignore file & folder tertentu
├── API_ENDPOINTS.md          # Dokumentasi lengkap endpoint API
├── SESSION_AUTHENTICATION.md # Auth flow & security documentation
├── GOOGLE_DRIVE_IMPLEMENTATION.md # Google Drive setup guide
├── credentials.json          # Google Drive OAuth credentials (JANGAN commit!)
├── package.json              # Dependency & scripts
├── package-lock.json         # Lock file dependency
├── README.md                 # Dokumentasi project (file ini)
├── node_modules/             # Dependency yang diinstall
└── src/                      # Source code utama
    ├── index.js              # Entry point aplikasi
    │
    ├── config/               # Konfigurasi
    │   ├── cloudinary.js     # Cloudinary config untuk gambar
    │   ├── googleDrive.js    # Google Drive API config
    │   ├── mongo.js          # MongoDB connection
    │   └── passport.js       # Passport config (future OAuth)
    │
    ├── controllers/          # Request handler
    │   ├── authController.js
    │   ├── capstoneController.js
    │   ├── groupController.js
    │   ├── notificationController.js
    │   ├── reviewController.js
    │   └── userController.js
    │
    ├── middlewares/          # Middleware (auth, role, access)
    │   ├── auth.js           # JWT verification
    │   ├── groupAccess.js    # Group access control
    │   ├── optionalAuth.js   # Optional authentication
    │   ├── role.js           # Role-based access control
    │   └── upload.js         # File upload middleware (multer)
    │
    ├── models/               # Schema MongoDB (Mongoose)
    │   ├── capstone.js
    │   ├── group.js
    │   ├── notification.js
    │   ├── request.js
    │   └── user.js
    │
    ├── routes/               # Routing endpoint
    │   ├── authRoutes.js
    │   ├── capstoneRoutes.js
    │   ├── groupRoutes.js
    │   ├── notificationRoutes.js
    │   ├── reviewRoutes.js
    │   └── userRoutes.js
    │
    ├── services/             # Business logic
    │   ├── authService.js
    │   ├── capstoneService.js
    │   ├── cloudinaryService.js
    │   ├── groupService.js
    │   ├── notificationService.js
    │   ├── otpService.js
    │   ├── reviewService.js
    │   ├── tokenService.js
    │   └── userService.js
    │
    └── utils/                # Helper / utility
        └── cookieUtils.js
```

---

## ⚙️ Setup & Instalasi

### 1. Clone repository

```bash
git clone https://github.com/shahwul/BEPAW3.git
cd BEPAW3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Google Drive API (untuk upload proposal PDF)

1. Buat project di [Google Cloud Console](https://console.cloud.google.com/)
2. Enable Google Drive API
3. Buat Service Account dan download `credentials.json`
4. Simpan `credentials.json` di root directory project
5. Buat folder di Google Drive untuk menyimpan file proposal
6. Share folder dengan service account email (dari credentials.json)
7. Copy Folder ID dari URL Google Drive

**Detail setup Google Drive:** Lihat [GOOGLE_DRIVE_IMPLEMENTATION.md](./GOOGLE_DRIVE_IMPLEMENTATION.md)

### 4. Setup Email (untuk OTP verification)

1. Gunakan akun Gmail
2. Enable 2-Factor Authentication
3. Generate App Password di Google Account Settings
4. Gunakan App Password (bukan password Gmail biasa) di `.env`

### 5. Buat file `.env` di root directory

Contoh isi file `.env`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/bepaw3
# atau MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bepaw3

# JWT Authentication (min 32 characters untuk security)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long-please-change-this

# Email Configuration (untuk OTP verification)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password-16-characters

# Google Drive API (untuk upload proposal PDF)
GOOGLE_DRIVE_FOLDER_ID=1a2b3c4d5e6f7g8h9i0j

# Cloudinary (untuk upload gambar hasil capstone)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL (untuk CORS configuration)
FRONTEND_URL=http://localhost:3000
```

**Catatan Penting:**

- ✅ `JWT_SECRET` harus **minimal 32 karakter** untuk keamanan
- ✅ `EMAIL_PASS` gunakan **App Password** dari Gmail (bukan password biasa)
- ✅ `GOOGLE_DRIVE_FOLDER_ID` didapat dari URL folder di Google Drive
- ✅ `CLOUDINARY_*` untuk upload gambar hasil capstone (opsional, bisa pakai dummy)
- ✅ Jangan commit file `.env` ke Git (sudah ada di `.gitignore`)
- ✅ Set `NODE_ENV=production` saat deploy ke server

### 6. Jalankan aplikasi

**Development mode (dengan auto-reload):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

Server akan berjalan di `http://localhost:5000`

---

## 📚 Dokumentasi API

Dokumentasi lengkap endpoint API dapat ditemukan di:

- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Complete API reference dengan contoh request/response
- **[SESSION_AUTHENTICATION.md](./SESSION_AUTHENTICATION.md)** - Authentication flow & security
- **[GOOGLE_DRIVE_IMPLEMENTATION.md](./GOOGLE_DRIVE_IMPLEMENTATION.md)** - Google Drive integration

**Quick Links:**

- 🔐 Authentication: `/api/auth/*` (register, login, verify OTP, logout)
- 👥 Users: `/api/users/*` (CRUD, role management)
- 📚 Capstones: `/api/capstones/*` (search, filter, CRUD)
- 👨‍👩‍👦 Groups: `/api/groups/*` (create, join, manage)
- 📝 Reviews: `/api/reviews/*` (alumni review system)
- 🔔 Notifications: `/api/notifications/*` (realtime notifications)

---

## ✨ Fitur Utama

### Autentikasi & Authorization

- ✅ Register dengan email UGM + OTP verification
- ✅ Login dengan JWT token (24 hours)
- ✅ Cookie-based authentication (httpOnly untuk security)
- ✅ Role-based access control (Admin, Dosen, Alumni, Mahasiswa)
- ✅ Pre-populated users (Admin dapat membuat user sebelumnya)

### Manajemen User

- ✅ CRUD user dengan role management
- ✅ Bulk create users (import dari CSV/Excel)
- ✅ Auto role assignment berdasarkan email domain
- ✅ Sparse unique index pada NIM (optional field)

### Manajemen Capstone Project

- ✅ Create, read, update, delete capstone
- ✅ Upload proposal PDF ke Google Drive (max 10MB)
- ✅ Upload gambar hasil ke Cloudinary (max 2 gambar, masing-masing 5MB)
- ✅ Advanced search & filter (judul, kategori, status)
- ✅ Access control untuk link proposal (admin + approved groups only)
- ✅ Kategori: Pengolahan Sampah, Smart City, Transportasi Ramah Lingkungan

### Manajemen Group

- ✅ Create group (1 ketua + max 3 anggota)
- ✅ Ketua memilih capstone untuk tim
- ✅ Upload CV gabungan
- ✅ Status tracking (pending, approved, rejected)

### Review System

- ✅ Alumni review proposal mahasiswa
- ✅ Approve/reject dengan alasan
- ✅ Notifikasi realtime untuk status update

### File Upload Integration

- ✅ **Google Drive** untuk proposal PDF (public access dengan link)
- ✅ **Cloudinary** untuk gambar hasil capstone (optimized, auto-resize)
- ✅ Auto-delete old files saat update/delete

### Notification System

- ✅ Realtime notifications untuk request, approval, rejection
- ✅ Mark as read functionality
- ✅ User-specific notification feed

---

## 🛠️ Teknologi

### Backend Framework

- **Node.js** v18+ → JavaScript runtime
- **Express.js** v5.1.0 → Web application framework
- **Mongoose** v8.18.2 → MongoDB ODM dengan schema validation

### Database

- **MongoDB** → NoSQL database
  - Sparse unique indexes (NIM field)
  - Population untuk relations
  - Auto-generated timestamps

### Authentication & Security

- **JWT (jsonwebtoken)** v9.0.2 → Token-based authentication (24h expiry)
- **bcryptjs** v3.0.2 → Password hashing dengan salt rounds 10
- **cookie-parser** v1.4.7 → Cookie parsing untuk JWT storage
- **OTP Service** → In-memory OTP storage dengan 10 min expiry
- **crypto-js** v4.2.0 → Cryptographic functions

### Email Service

- **nodemailer** v7.0.6 → Email delivery untuk OTP verification
  - Support Gmail dengan App Password
  - HTML email templates

### File Upload & Storage

- **Google Drive API (googleapis)** v166.0.0
  - Upload proposal PDF (max 10MB)
  - Service Account authentication
  - Public file sharing

- **Cloudinary** v2.8.0
  - Upload gambar hasil capstone (max 5MB per image)
  - Auto-optimization & resizing
  - WebP conversion untuk performance

- **Multer** v2.0.2
  - File upload middleware
  - Memory storage untuk buffer processing

### Middleware & Utilities

- **cors** v2.8.5 → Cross-Origin Resource Sharing
- **dotenv** v17.2.2 → Environment variable management

### Development Tools

- **nodemon** v3.1.10 → Auto-reload saat development
- **Git** → Version control

---

## 🏗️ Arsitektur

```plaintext
┌─────────────┐
│   Client    │ (React/Vue Frontend)
│  (Browser)  │
└──────┬──────┘
       │ HTTP + Cookies
       ▼
┌─────────────────────────────────────┐
│     Express.js Server               │
│  ┌───────────────────────────────┐  │
│  │  Middlewares                  │  │
│  │  - CORS                       │  │
│  │  - Cookie Parser              │  │
│  │  - Auth (JWT Verification)    │  │
│  │  - Role (RBAC)                │  │
│  │  - Group Access               │  │
│  │  - Upload (Multer)            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Routes → Controllers         │  │
│  │  - authRoutes                 │  │
│  │  - userRoutes                 │  │
│  │  - capstoneRoutes             │  │
│  │  - groupRoutes                │  │
│  │  - reviewRoutes               │  │
│  │  - notificationRoutes         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Services (Business Logic)    │  │
│  │  - authService (OTP)          │  │
│  │  - userService                │  │
│  │  - capstoneService            │  │
│  │  - cloudinaryService          │  │
│  │  - groupService               │  │
│  │  - reviewService              │  │
│  │  - notificationService        │  │
│  └───────────────────────────────┘  │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│     MongoDB (Mongoose ODM)          │
│  - Users (nim: sparse unique)       │
│  - Capstones                        │
│  - Groups (ketua separate)          │
│  - Requests                         │
│  - Reviews                          │
│  - Notifications                    │
└──────────┬──────────────────────────┘
           │
           ├──────────────┐
           ▼              ▼
   ┌──────────────┐  ┌──────────────┐
   │ Google Drive │  │  Cloudinary  │
   │  (Proposal)  │  │   (Images)   │
   └──────────────┘  └──────────────┘
```

---

## 🔒 Security Features

- ✅ **httpOnly Cookies** - Prevents XSS attacks
- ✅ **bcrypt Password Hashing** - One-way encryption dengan salt
- ✅ **JWT Token Expiry** - 24 hours automatic expiry
- ✅ **OTP Email Verification** - Prevents bot registrations
- ✅ **Email Domain Validation** - UGM email required
- ✅ **Role-Based Access Control** - Granular permissions
- ✅ **CORS Configuration** - Cross-origin security
- ✅ **HTTPS in Production** - Secure cookies
- ✅ **Sparse Unique Index** - NIM uniqueness without conflicts
- ✅ **Input Validation** - Mongoose schema validation
- ✅ **File Type Validation** - Only PDF for proposals, images for hasil
- ✅ **File Size Limits** - 10MB PDF, 5MB per image

---

## 🚀 Quick Start Guide

### Untuk Developer

#### 1. Setup Database

```bash
# Install MongoDB Community Edition
# Download dari: https://www.mongodb.com/try/download/community

# Start MongoDB service
mongod

# Atau gunakan MongoDB Atlas (cloud):
# https://www.mongodb.com/cloud/atlas
```

#### 2. Setup Email untuk OTP

- Login ke Google Account
- Enable 2-Factor Authentication
- Buka Security Settings → App Passwords
- Generate App Password untuk "Mail"
- Copy 16-character password
- Paste ke `.env` file sebagai `EMAIL_PASS`

#### 3. Setup Google Drive API

- Ikuti langkah di [GOOGLE_DRIVE_IMPLEMENTATION.md](./GOOGLE_DRIVE_IMPLEMENTATION.md)
- Download `credentials.json` dari Google Cloud Console
- Simpan di root directory
- Share folder Drive dengan service account email

#### 4. Setup Cloudinary (Optional)

- Daftar di [cloudinary.com](https://cloudinary.com)
- Copy Cloud Name, API Key, API Secret
- Paste ke `.env` file

#### 5. First Run

```bash
npm install
npm run dev
```

Server akan berjalan di `http://localhost:5000`

#### 6. Create Admin User (Manual)

Gunakan MongoDB Compass atau mongo shell:

```javascript
// MongoDB Compass atau mongosh
db.users.insertOne({
  email: "admin@ugm.ac.id",
  password: "$2b$10$hashed_password_here", // Gunakan bcrypt untuk hash
  name: "Admin",
  role: "admin",
  isVerified: true,
  isClaimed: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Atau hash password dengan bcrypt:**

```javascript
// Node.js REPL atau create script
const bcrypt = require('bcryptjs');
const password = 'admin123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash); // Copy hash ini ke MongoDB
```

### Testing API dengan Postman/cURL

#### 1. Register User Baru

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@mail.ugm.ac.id",
    "password": "test123",
    "name": "Test User"
  }'
```

#### 2. Verify OTP (check email)

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@mail.ugm.ac.id",
    "otp": "123456"
  }'
```

#### 3. Get Capstones (dengan cookie)

```bash
curl -X GET http://localhost:5000/api/capstones \
  -b cookies.txt
```

#### 4. Create Capstone (admin only)

```bash
curl -X POST http://localhost:5000/api/capstones \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "judul=Test Capstone" \
  -F "kategori=Pengolahan Sampah" \
  -F "ketua=USER_ID" \
  -F "dosen=DOSEN_ID" \
  -F "abstrak=Test abstrak" \
  -F "proposal=@/path/to/proposal.pdf"
```

---

## 🚀 Deployment

### Environment Variables (Production)

Pastikan set semua environment variables di platform deployment:

**Platform yang Didukung:**

- Heroku
- Railway
- Render
- Google Cloud Platform
- AWS (EC2, Elastic Beanstalk)
- DigitalOcean

**Required Environment Variables:**

```env
# Node Environment
NODE_ENV=production

# Server
PORT=5000

# Database (gunakan MongoDB Atlas untuk production)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/bepaw3

# Authentication (WAJIB ganti dengan string random 32+ karakter)
JWT_SECRET=your-production-secret-minimum-32-characters-random-string

# Email Service
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password-16-chars

# Google Drive API
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# Cloudinary (untuk gambar)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# CORS (URL frontend production)
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Checklist untuk Production

- ✅ Set `NODE_ENV=production`
- ✅ Use strong `JWT_SECRET` (min 32 characters, random string)
- ✅ Enable HTTPS (SSL certificate) untuk secure cookies
- ✅ Configure CORS properly dengan `FRONTEND_URL` yang benar
- ✅ Use MongoDB Atlas dengan authentication enabled
- ✅ Jangan expose `credentials.json` (add ke `.gitignore`)
- ✅ Keep dependencies updated (`npm audit` & `npm update`)
- ✅ Enable rate limiting (future enhancement)
- ✅ Setup monitoring & logging (PM2, Winston, etc.)
- ✅ Backup database secara berkala

### Deploy ke Heroku (Example)

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create bepaw3-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-here
heroku config:set MONGODB_URI=your-mongodb-atlas-uri
# ... set semua env variables lainnya

# Deploy
git push heroku main

# Check logs
heroku logs --tail
```

### Deploy ke Railway (Example)

1. Connect GitHub repository
2. Add environment variables di Railway dashboard
3. Railway auto-deploy setiap push ke main branch
4. Get deployment URL dari Railway dashboard

---

## 🤝 Contributing

### How to Contribute

1. Fork repository
2. Create feature branch

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. Commit changes dengan descriptive message

   ```bash
   git commit -m 'Add: amazing feature with detailed description'
   ```

4. Push to branch

   ```bash
   git push origin feature/amazing-feature
   ```

5. Open Pull Request di GitHub

### Coding Standards

**Architecture:**

- Follow MVC pattern (Model-View-Controller)
- Separation of concerns: Routes → Controllers → Services → Models
- Keep business logic in Services, not Controllers
- Use Middlewares for reusable logic (auth, validation, etc.)

**Code Style:**

- Use meaningful variable and function names (camelCase)
- Add JSDoc comments for complex functions
- Keep functions small and focused (single responsibility)
- Use async/await instead of callbacks
- Handle errors properly with try-catch

**Before Committing:**

- ✅ Test endpoints dengan Postman/cURL
- ✅ Check for console errors
- ✅ Update documentation jika ada perubahan API
- ✅ Run `npm audit` untuk security check
- ✅ Ensure `.env` tidak ter-commit (check `.gitignore`)

**Git Commit Message Convention:**

- `Add:` untuk fitur baru
- `Fix:` untuk bug fixes
- `Update:` untuk perubahan existing feature
- `Refactor:` untuk code refactoring
- `Docs:` untuk dokumentasi
- `Test:` untuk testing

**Example:**

```bash
git commit -m "Add: Google Drive integration for PDF uploads"
git commit -m "Fix: OTP expiry validation in authService"
git commit -m "Update: Cloudinary upload with auto-optimization"
```

---

## 📝 Changelog

### Version 2.0 (Major Update) - November 2025

**Authentication & Security:**

- ✅ Single Token System - Simplified dari dual-token ke single JWT (24h)
- ✅ OTP Email Verification - Added OTP verification untuk registrasi
- ✅ Pre-populated Users - Admin dapat create user yang dapat di-claim
- ✅ Cookie-based Auth - httpOnly cookies untuk XSS protection

**User Management:**

- ✅ Academic Data - Added NIM dan Prodi fields untuk mahasiswa/alumni
- ✅ Minimal Registration - Hanya email+password required
- ✅ Sparse Unique Index - NIM unique tapi optional
- ✅ Bulk Create Users - Import multiple users sekaligus

**Capstone Features:**

- ✅ Advanced Search - Filter dan sorting untuk capstone
- ✅ Google Drive Integration - Upload proposal PDF ke Google Drive
- ✅ Cloudinary Integration - Upload gambar hasil dengan auto-optimization
- ✅ Access Control - Link proposal restriction untuk security
- ✅ Category System - 3 kategori wajib (Pengolahan Sampah, Smart City, Transportasi)

**Data Model Updates:**

- ✅ Ketua Separated - Ketua separated dari anggota array di Group & Capstone
- ✅ Generalized Endpoints - PATCH `/api/users/:id` untuk semua field updates
- ✅ Status Tracking - Capstone status: Tersedia/Tidak Tersedia

**Documentation:**

- ✅ Complete Documentation - API_ENDPOINTS.md dengan contoh lengkap
- ✅ SESSION_AUTHENTICATION.md - Authentication flow & security
- ✅ GOOGLE_DRIVE_IMPLEMENTATION.md - Google Drive setup guide

### Version 1.0 - Initial Release (Oktober 2025)

- ✅ Basic authentication system (login, register)
- ✅ Capstone CRUD operations
- ✅ Group management
- ✅ Review system (alumni approve/reject)
- ✅ Notification system
- ✅ Role-based access control

---

## 📄 Laporan

Laporan lengkap dapat ditemukan di:

📎 [**Laporan Final - CapCon.pdf**](https://drive.google.com/file/d/1x-VHX4Dy4iFcgrFt6_LSdF6KcqDMXBUJ/view?usp=sharing)

---

## 📧 Contact

### Kelompok PAW 3 - DTETI UGM

- 👨‍💻 Repository: [github.com/shahwul/BEPAW3](https://github.com/shahwul/BEPAW3)
- 🐛 Issues: [GitHub Issues](https://github.com/shahwul/BEPAW3/issues)
- 📧 Email: Kontak anggota kelompok melalui email UGM

**Team Members:**

- Hanifah Putri Ariani - 22/504042/TK/55111 (Ketua)
- Navika Berlianda Rihadatul'aisya - 22/505243/TK/55277
- Raudha Nur Hidayatullah Susanto - 22/500044/TK/54789
- Muhammad Haidar Syaafi' - 23/521614/TK/57545
- Syahrul Afif Tri Anggara - 23/518266/TK/57027

---

## 📜 License

This project is developed for educational purposes as part of **PAW (Pemrograman Aplikasi Web)** course at **Universitas Gadjah Mada**.

---

**Last Updated:** November 13, 2025  
**Version:** 2.0 (Major Update)  
**Maintained by:** Kelompok PAW 3
