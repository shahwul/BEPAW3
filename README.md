# CapCon - Capstone Container

## Deskripsi Aplikasi
CapCon (Capstone Container) adalah aplikasi web yang memfasilitasi alur informasi dan koordinasi antara **Mahasiswa**, **Alumni**, **Dosen**, dan **Admin** dalam program capstone.  

**Fitur Utama:**
- **Mahasiswa** dapat melihat daftar capstone yang ditawarkan, membentuk grup (max 4: 1 ketua + 3 anggota), dan mengajukan request/proposal
- **Alumni** dapat membuat dan mengelola capstone serta melakukan review proposal mahasiswa
- **Dosen** dapat melakukan review dan memberikan feedback terhadap capstone project
- **Admin** mengelola data pengguna (termasuk pre-populated users), capstone, dan memastikan alur capstone berjalan lancar

**Keunggulan Sistem:**
- 🔐 **OTP Email Verification** untuk keamanan registrasi
- 👥 **Pre-populated Users** - Admin dapat membuat user sebelumnya yang dapat di-claim
- 🎓 **Data Akademik** - Support NIM dan Prodi untuk mahasiswa/alumni
- 🔍 **Advanced Search** - Filter berdasarkan judul, kategori, status dengan sorting
- 🔒 **Access Control** - Link proposal hanya bisa diakses oleh admin dan grup yang sudah approved
- 📊 **Separation of Concerns** - Ketua dan anggota dipisah untuk kemudahan frontend

Tujuan utama aplikasi ini adalah memberikan kemudahan informasi, transparansi, dan efisiensi dalam proses capstone mahasiswa TETI.

---

## Nama Kelompok & Anggota
**Kelompok:** PAW 3
- Hanifah Putri Ariani (22/504042/TK/55111) - Ketua
- Navika Berlianda Rihadatul'aisya (22/505243/TK/55277)
- Raudha Nur Hidayatullah Susanto (22/500044/TK/54789)
- Muhammad Haidar Syaafi' (23/521614/TK/57545)
- Syahrul Afif Tri Anggara (23/518266/TK/57027)

---

## Struktur Folder & File
Struktur project (disederhanakan):
```
/ (root)
├── .env                      # Environment variables
├── .gitignore                # Ignore file & folder tertentu
├── API_ENDPOINTS.md          # Dokumentasi endpoint API
├── credentials.json          # Konfigurasi OAuth Google (mis. untuk GDrive)
├── package.json              # Dependency & script
├── package-lock.json         # Lock file dependency
├── README.md                 # Dokumentasi project
├── node_modules/             # Dependency yang diinstall
└── src/                      # Source code utama
    ├── index.js              # Entry point aplikasi
    │
    ├── config/               # Konfigurasi (MongoDB, Passport, Google Drive)
    │   ├── googleDrive.js
    │   ├── mongo.js
    │   └── passport.js
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
    │   ├── auth.js
    │   ├── groupAccess.js
    │   └── role.js
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
    │   ├── groupService.js
    │   ├── notificationService.js
    │   ├── otpService.js
    │   ├── refreshTokenService.js
    │   ├── reviewService.js
    │   └── userService.js
    │
    └── utils/                # Helper / utility
        └── cookieUtils.js
```

---

## ⚙️ Setup & Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/shahwul/BEPAW3.git
   cd BEPAW3
    ```
2. **Install dependencies**
    ```bash
    npm install
    ``` 
3. **Buat file `.env` di root directory**
   Contoh isi file `.env`:
    ```env
    # Server Configuration
    PORT=5000
    NODE_ENV=development
    
    # Database
    MONGODB_URI=mongodb://localhost:27017/bepaw3
    
    # JWT Authentication (use strong random string, min 32 characters)
    JWT_SECRET=your-super-secret-key-minimum-32-characters-long
    
    # Email Configuration (for OTP verification)
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASS=your-gmail-app-password
    
    # Google Drive Integration (optional)
    GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
    GOOGLE_CLIENT_SECRET=xxx
    GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
    
    # Frontend URL (for CORS)
    FRONTEND_URL=http://localhost:3000
    ```
   
   **Catatan:**
   - Untuk `EMAIL_PASS`, gunakan **App Password** dari Gmail (bukan password biasa)
   - `JWT_SECRET` harus minimal 32 karakter untuk keamanan
   - Set `NODE_ENV=production` saat deploy
4. **Jalankan aplikasi**

    ```bash
    npm start
    ```
   
   atau untuk development dengan auto-reload:
   
    ```bash
    npm run dev
    ```

---

## 📚 Dokumentasi API

Dokumentasi lengkap endpoint API dapat ditemukan di:
- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Complete API reference
- **[SESSION_AUTHENTICATION.md](./SESSION_AUTHENTICATION.md)** - Authentication & session management

---

## ✨ Fitur Utama

### 🔐 Authentication & Authorization
- **OTP Email Verification** - Keamanan registrasi dengan OTP 6 digit (10 menit expiry)
- **JWT Token** - Single token system dengan 24 jam expiry
- **Role-Based Access Control** - 5 roles: admin, dosen, alumni, mahasiswa, guest
- **Pre-populated Users** - Admin dapat membuat user yang dapat di-claim
- **Email Domain Validation** - Auto role assignment (@ugm.ac.id, @mail.ugm.ac.id)

### 👥 User Management
- **Minimal Registration** - Hanya email + password required
- **Academic Data** - NIM dan Prodi untuk mahasiswa/alumni
- **User Claiming** - Pre-populated user dapat di-claim dengan OTP verification
- **Profile Management** - Update name, nim, prodi, role (admin only)

### 📚 Capstone Management
- **Advanced Search** - Filter by judul, kategori, status
- **Sorting** - Sort by terbaru (newest) atau judul (A-Z)
- **Access Control** - Link proposal hanya untuk admin dan grup yang approved
- **CRUD Operations** - Create, read, update, delete capstone projects
- **Data Separation** - Ketua dan anggota terpisah untuk kemudahan frontend

### 👨‍👩‍👦 Group Management
- **Group Formation** - Max 4 members (1 ketua + 3 anggota)
- **Separate Ketua** - Ketua tidak termasuk dalam array anggota
- **Group Access Control** - Only ketua dan anggota can modify group
- **Request System** - Request to join capstone with approval flow

### 📝 Review & Feedback
- **Alumni Review** - Alumni can review assigned capstones
- **Dosen Review** - Dosen provides feedback and assessment
- **Review Management** - Approve, reject, or request revision

### 🔔 Notification System
- **Real-time Notifications** - Request status, approvals, updates
- **Notification Types** - Request, approval, rejection, review
- **Mark as Read** - User can mark notifications as read

### 📁 Google Drive Integration
- **File Upload** - Upload proposal and documents to Google Drive
- **Secure Storage** - Files stored in organized folder structure
- **Access Management** - Only authorized users can access files

---

## 🛠️ Teknologi

**Backend:**
- **Node.js + Express.js** → Backend framework  
- **MongoDB + Mongoose** → Database & ODM dengan sparse unique indexes
- **JWT (JSON Web Token)** → Token-based authentication (24h expiry)
- **bcrypt** → Password hashing (salt rounds: 10)
- **nodemailer** → Email delivery untuk OTP verification

**Authentication:**
- **OTP Service** → In-memory OTP storage dengan auto-expiry
- **Cookie-based Auth** → httpOnly cookies untuk security
- **Passport.js** → Authentication middleware (future: OAuth)

**Integration:**
- **Google Drive API** → File upload dan storage
- **cookie-parser** → Cookie parsing middleware
- **cors** → Cross-Origin Resource Sharing

**Development:**
- **nodemon** → Auto-reload during development
- **dotenv** → Environment variable management

---

## 🏗️ Arsitektur

```
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
│  │  - capstoneService (Search)   │  │
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
└─────────────────────────────────────┘
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

---

## � Quick Start Guide

### Untuk Developer

1. **Setup Database**
   ```bash
   # Install MongoDB
   # Start MongoDB service
   mongod
   ```

2. **Setup Email (Gmail)**
   - Enable 2FA di Google Account
   - Generate App Password di Google Account Settings
   - Gunakan App Password di `.env` file

3. **First Run**
   ```bash
   npm install
   npm run dev
   ```

4. **Create Admin User**
   ```bash
   # Gunakan MongoDB Compass atau mongo shell
   db.users.insertOne({
     email: "admin@ugm.ac.id",
     password: "$2b$10$hashed_password_here",
     name: "Admin",
     role: "admin",
     isVerified: true,
     isClaimed: true
   })
   ```

### Testing API

Gunakan Postman atau cURL untuk testing:

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.ugm.ac.id","password":"test123"}'

# Verify OTP (check email)
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@mail.ugm.ac.id","otp":"123456"}'

# Get Capstones (with cookie)
curl -X GET http://localhost:5000/api/capstones \
  -b cookies.txt
```

---

## 🚀 Deployment

### Environment Variables (Production)

Pastikan set semua environment variables di platform deployment (Heroku, Railway, Vercel, dll):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bepaw3
JWT_SECRET=your-production-secret-min-32-chars
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=https://your-frontend-domain.com
```

### Security Checklist

- ✅ Set `NODE_ENV=production`
- ✅ Use strong `JWT_SECRET` (min 32 characters)
- ✅ Enable HTTPS (secure cookies)
- ✅ Configure CORS properly
- ✅ Use MongoDB Atlas with authentication
- ✅ Enable rate limiting (future enhancement)
- ✅ Keep dependencies updated

---

## 📚 API Documentation

Dokumentasi lengkap tersedia di:

- **[API_ENDPOINTS.md](./API_ENDPOINTS.md)** - Complete API reference dengan contoh request/response
- **[SESSION_AUTHENTICATION.md](./SESSION_AUTHENTICATION.md)** - Authentication flow, security, dan best practices

**Endpoint Categories:**
- 🔐 `/api/auth/*` - Authentication (register, login, verify OTP, logout)
- 👥 `/api/users/*` - User management (CRUD, role-based)
- 📚 `/api/capstones/*` - Capstone management (search, filter, CRUD)
- 👨‍👩‍👦 `/api/groups/*` - Group management (create, join, manage)
- 📝 `/api/reviews/*` - Review & feedback system
- 🔔 `/api/notifications/*` - Notification system

---

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

**Coding Standards:**
- Follow existing code structure (controllers, services, routes)
- Use meaningful variable/function names
- Add comments for complex logic
- Test endpoints before committing
- Update documentation when adding features

---

## 📝 Changelog

### Version 2.0 (Major Update) - November 2025
- ✅ **Single Token System** - Simplified dari dual-token ke single JWT (24h)
- ✅ **OTP Email Verification** - Added OTP verification untuk registrasi
- ✅ **Pre-populated Users** - Admin dapat create user yang dapat di-claim
- ✅ **Academic Data** - Added NIM dan Prodi fields untuk mahasiswa/alumni
- ✅ **Minimal Registration** - Hanya email+password required
- ✅ **Advanced Search** - Filter dan sorting untuk capstone
- ✅ **Access Control** - Link proposal restriction untuk security
- ✅ **Data Model Update** - Ketua separated dari anggota array
- ✅ **Generalized Endpoints** - PATCH /api/users/:id untuk semua field updates
- ✅ **Complete Documentation** - SESSION_AUTHENTICATION.md added

### Version 1.0 - Initial Release
- Basic authentication system
- Capstone CRUD operations
- Group management
- Review system
- Notification system
- Google Drive integration

---

## �📄 Laporan

Laporan lengkap dapat ditemukan di [Laporan.pdf](https://drive.google.com/file/d/1x-VHX4Dy4iFcgrFt6_LSdF6KcqDMXBUJ/view?usp=sharing).

---

## 📧 Contact

**Kelompok PAW 3**
- Repository: [github.com/shahwul/BEPAW3](https://github.com/shahwul/BEPAW3)
- Email: Kontak anggota kelompok melalui email UGM

---

## 📜 License

This project is developed for educational purposes as part of PAW (Pemrograman Aplikasi Web) course at Universitas Gadjah Mada.

---

**Last Updated:** November 12, 2025  
**Version:** 2.0 (Major Update)  
**Branch:** `major-update-be`
