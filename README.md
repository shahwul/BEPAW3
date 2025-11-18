# Capstone Container

## Deskripsi Aplikasi

Capstone Container adalah aplikasi manajemen proyek capstone berbasis web yang memudahkan pengelolaan data tim, anggota, dosen pembimbing, dan proses pelaporan serta notifikasi. Aplikasi ini mendukung fitur administrasi, alumni, mahasiswa, dan otentikasi pengguna.

## Nama Kelompok dan Daftar Anggota

**Nama Kelompok:** Kelompok Tiga  
**Aplikasi:** Capstone Container

**Daftar Anggota Kelompok:**
- Hanifah Putri Ariani (22/504042/TK/55111) - Ketua
- Navika Berlianda Rihadatul'aisya (22/505243/TK/55277)
- Raudha Nur Hidayatullah Susanto (22/500044/TK/54789)
- Muhammad Haidar Syaafi' (23/521614/TK/57545)
- Syahrul Afif Tri Anggara (23/518266/TK/57027)
*(Silakan lengkapi nama anggota sesuai tim Anda)*

## Fitur Utama

1. **Centralized Capstone Repository**
	Menyediakan wadah terpusat untuk melihat project capstone terdahulu, lengkap dengan ringkasan, dosen pembimbing, dan tim terkait. Mahasiswa dapat menemukan referensi yang relevan dengan kebutuhan kelompok mereka.

2. **Project Continuation Request Flow**
	Mahasiswa dapat mengajukan permintaan untuk melanjutkan project alumni melalui alur struktur yang jelas. Setiap request disertai alasan, dan alumni dapat melihat detail tim sebelum memberi keputusan.

3. **Alumni Approval System**
	Alumni memiliki notification khusus untuk meninjau, menyetujui, atau menolak pengajuan kelanjutan project. Proses ini menjamin kelanjutan project sesuai perencanaan dan ekspektasi alumni selaku pemilik.

4. **Admin-Controlled Master Data**
	Admin memegang kendali penuh atas data mahasiswa, alumni, dosen, dan tim, memastikan seluruh informasi valid dan konsisten. Setiap perubahan data terpusat sehingga error dapat diminimalisir.

5. **Automated Project Availability Status**
	Setiap project otomatis berubah status menjadi Unavailable jika telah menerima tiga request aktif, untuk menjaga fairness bagi seluruh kelompok.

6. **Document Integration via Google Drive**
	Unggah proposal, laporan, dan dokumen terkait melalui integrasi Google Drive, memudahkan pengelolaan file tanpa beban penyimpanan server tambahan.

## Struktur Folder dan File

```
  BEPAW3/
├── API_ENDPOINTS.md
├── credentials.json
├── package.json
├── package-lock.json
├── README.md
├── vercel.json
└── src/
├── index.js # Entry point (Express server)
│
├── api/
│ └── cron.js # Scheduled tasks (node-cron)
│
├── config/ # Configuration files
│ ├── cloudinary.js # Cloudinary setup
│ ├── googleDrive.js # Google Drive API config
│ ├── mongo.js # MongoDB connection
│ └── passport.js # Passport JWT strategy
│
├── controllers/ # Handle request/response logic
│ ├── authController.js
│ ├── capstoneController.js
│ ├── groupController.js
│ ├── notificationController.js
│ ├── reviewController.js
│ └── userController.js
│
├── middlewares/ # Middleware utilities
│ ├── apiKey.js
│ ├── auth.js
│ ├── groupAccess.js
│ ├── optionalAuth.js
│ ├── role.js
│ └── upload.js
│
├── models/ # MongoDB models (Mongoose)
│ ├── capstone.js
│ ├── group.js
│ ├── notification.js
│ ├── request.js
│ └── user.js
│
├── routes/ # API routing
│ ├── authRoutes.js
│ ├── capstoneRoutes.js
│ ├── groupRoutes.js
│ ├── notificationRoutes.js
│ ├── reviewRoutes.js
│ └── userRoutes.js
│
├── services/ # Business logic layer
│ ├── authService.js
│ ├── capstoneService.js
│ ├── cloudinaryService.js
│ ├── groupService.js
│ ├── notificationService.js
│ ├── otpService.js
│ ├── requestCleanupService.js
│ ├── reviewService.js
│ ├── tokenService.js
│ └── userService.js
│
└── utils/ # Helper utilities
├── cookieUtils.js
└── responseFormatter.js 
```

## Teknologi yang Digunakan

- **Node.js** — runtime backend
- **Express.js** — web server
- **MongoDB + Mongoose** — database & ODM
- **JWT (jsonwebtoken)** — autentikasi
- **Bcryptjs** — hashing password
- **Multer + Cloudinary** — upload & penyimpanan file
- **Google APIs** — integrasi Google Drive
- **nodemailer** — pengiriman email

## Cara Instalasi dan Menjalankan

1. **Clone repository**
	```bash
	git clone https://github.com/shahwul/BEPAW3.git
	cd BEPAW3
	```

2. **Install dependencies**
	```bash
	npm install
	```

3. **Konfigurasi environment**
	- Buat file `.env` sesuai kebutuhan (lihat contoh pada dokumentasi atau tanya admin).

4. **Jalankan aplikasi**
  - Untuk mode development (auto-restart):
    ```bash
	    npm run dev
    ```
  - Untuk mode production:
    ```bash
      npm start
    ```
    
## Link Laporan

[Klik untuk membuka laporan](https://drive.google.com/file/d/1x-VHX4Dy4iFcgrFt6_LSdF6KcqDMXBUJ/view?usp=sharing)

## URL Deploy

[capcon-api.vercel.app](https://capcon-api.vercel.app)
