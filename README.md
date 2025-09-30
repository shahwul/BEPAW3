# CapCon - Capstone Container

## Deskripsi Aplikasi
CapCon (Capstone Container) adalah aplikasi web yang memfasilitasi alur informasi dan koordinasi antara **Mahasiswa**, **Alumni**, dan **Admin** dalam program capstone.  
- **Mahasiswa** dapat melihat daftar capstone yang ditawarkan alumni serta mengajukan request/proposal.  
- **Alumni** dapat membuat dan mengelola capstone serta melakukan review proposal mahasiswa.  
- **Admin** mengelola data pengguna, capstone, dan memastikan alur capstone berjalan lancar.  

Tujuan utama aplikasi ini adalah memberikan kemudahan informasi, transparansi, dan efisiensi dalam proses capstone mahasiswa TETI.

---

## Nama Kelompok & Anggota
**Kelompok:** PAW 3
- Hanifah Putri Ariani (22/504042/TK/55111) - Ketua
- Muhammad Farhan Fadhlurrahman (22/505243/TK/552
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
    ```
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/capstone_db
    JWT_SECRET=your_secret_key
    GOOGLE_CLIENT_ID=xxx
    GOOGLE_CLIENT_SECRET=xxx
    GOOGLE_REDIRECT_URI=xxx
    ```
4. **Jalankan aplikasi**
    ```bash
    npm start
    ```

---

## 📚 Dokumentasi API
Dokumentasi endpoint API dapat ditemukan di [API_ENDPOINTS.md](./API_ENDPOINTS.md).

---

## ✨ Fitur
* Autentikasi (Login, Register, OTP, Refresh Token)
* Manajemen User (Role-based: Admin, Dosen, Mahasiswa)
* Manajemen Capstone Project (buat, lihat, join group)
* Integrasi Google Drive (upload file laporan / dokumen)
* Notifikasi (request, approval, status)
* Review & Feedback dari dosen

---

## 🛠️ Teknologi
- **Node.js + Express.js** → backend framework  
- **MongoDB + Mongoose** → database & ODM  
- **Passport.js** → autentikasi  
- **JWT (JSON Web Token)** → autentikasi berbasis token  
- **Google Drive API** → integrasi upload laporan  
- **OTP Service** → verifikasi pengguna  
- **cookie-utils** → utilitas cookie

---

## 📄 Laporan
Laporan lengkap dapat ditemukan di [Laporan.pdf](./Laporan.pdf).