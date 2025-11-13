# 📚 API Endpoints Documentation

Base URL: `http://localhost:5000/api`

## 📋 Table of Contents

- [Endpoint Overview](#-endpoint-overview)
- [Authentication](#-authentication)
- [Users](#-users)
- [Capstones](#-capstones)
- [Groups](#-groups)
- [Reviews](#-reviews)
- [Notifications](#-notifications)

---

## 📊 Endpoint Overview

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/register` | ❌ | - | Register user baru dengan OTP |
| POST | `/verify-otp` | ❌ | - | Verify OTP setelah register |
| POST | `/login` | ❌ | - | Login dengan email & password |
| POST | `/logout` | ✅ | All | Logout user |

### 👥 Users (`/api/users`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/` | ✅ | admin | Create pre-populated user |
| POST | `/bulk` | ✅ | admin | Bulk create pre-populated users |
| GET | `/` | ✅ | admin, dosen | Get all users |
| GET | `/:id` | ✅ | admin, dosen | Get user by ID |
| PATCH | `/:id` | ✅ | admin | Update user (role, name, email, nim, prodi, etc) |
| DELETE | `/:id` | ✅ | admin | Delete user |

### 📚 Capstones (`/api/capstones`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/` | ✅ | admin | Create new capstone |
| GET | `/stats` | ✅ | admin | Get capstone request statistics |
| GET | `/search` | ⚠️ Optional | All | Search capstones (filter & sort) |
| GET | `/` | ⚠️ Optional | All | Get all capstones |
| GET | `/:id` | ⚠️ Optional | All | Get capstone detail (access control for proposalUrl) |
| PUT | `/:id` | ✅ | admin | Update capstone |
| DELETE | `/:id` | ✅ | admin | Delete capstone |

### 👨‍👩‍👦 Groups (`/api/groups`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/` | ✅ | admin | Create new group |
| GET | `/:id` | ✅ | All | Get group detail |
| PUT | `/:id` | ✅ | admin | Update group |
| DELETE | `/:id` | ✅ | admin | Delete group |
| POST | `/:id/pilih` | ✅ | mahasiswa (ketua) | Ketua pilih capstone untuk group |

### 📝 Reviews (`/api/reviews`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| GET | `/pending` | ✅ | alumni | Get pending reviews for alumni's capstones |
| POST | `/:id` | ✅ | alumni | Alumni review group proposal |

### 🔔 Notifications (`/api/notifications`)

| Method | Endpoint | Auth Required | Role | Description |
|--------|----------|---------------|------|-------------|
| POST | `/` | ✅ | All | Create notification |
| GET | `/` | ✅ | All | Get user's notifications |
| PATCH | `/:id/read` | ✅ | All | Mark notification as read |

---

## 🔐 Authentication

Base Path: `/api/auth`

### 1. Register

**POST** `/api/auth/register`

Register user baru dengan OTP verification.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@mail.ugm.ac.id",
  "password": "password123",
  "name": "John Doe",         // Optional
  "nim": "22/504042/TK/55111", // Optional (mahasiswa/alumni only)
  "prodi": "Teknik Komputer"   // Optional (mahasiswa/alumni only)
}
```

**Response Success (201):**
```json
{
  "message": "Registrasi berhasil. Cek email untuk kode OTP",
  "email": "student@mail.ugm.ac.id",
  "needVerification": true
}
```

**Response Error (400):**
```json
{
  "message": "Email sudah terdaftar"
}
```

**Notes:**
- Email harus domain `@mail.ugm.ac.id` atau `@ugm.ac.id`
- OTP dikirim ke email dan berlaku 10 menit
- Role auto-assigned: `@mail.ugm.ac.id` → mahasiswa, `@ugm.ac.id` → dosen

---

### 2. Verify OTP

**POST** `/api/auth/verify-otp`

Verify OTP setelah registrasi.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@mail.ugm.ac.id",
  "otp": "123456"
}
```

**Response Success (200):**
```json
{
  "message": "OTP berhasil diverifikasi",
  "user": {
    "id": "673...",
    "name": "John Doe",
    "email": "student@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Set-Cookie:**
```
token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

**Response Error (400):**
```json
{
  "message": "OTP tidak valid atau sudah expired"
}
```

**Notes:**
- User otomatis login setelah verify OTP
- JWT token set di httpOnly cookie (expires 24 jam)
- Token juga bisa digunakan di header `Authorization: Bearer {token}`

---

### 3. Login

**POST** `/api/auth/login`

Login dengan email dan password.

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "student@mail.ugm.ac.id",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "673...",
    "name": "John Doe",
    "email": "student@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Set-Cookie:**
```
token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

**Response Error (400):**
```json
{
  "message": "Email tidak ditemukan"
}
// or
{
  "message": "Password salah"
}
// or
{
  "message": "Email belum diverifikasi"
}
```

**Notes:**
- Email harus domain UGM (kecuali user dengan role `admin` di database)
- User harus sudah verified (OTP)
- JWT token expires dalam 24 jam

---

### 4. Logout

**POST** `/api/auth/logout`

Logout user (clear cookie).

**Headers:**
```
Authorization: Bearer {token}
// or cookie auto-sent
```

**Response Success (200):**
```json
{
  "message": "Logout berhasil"
}
```

**Clear-Cookie:**
```
token=; Max-Age=0
```

---

## 👥 Users

Base Path: `/api/users`

### 1. Create Pre-Populated User

**POST** `/api/users`

Admin membuat user yang bisa di-claim nanti (pre-populated).

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Required Role:** `admin`

**Request Body:**
```json
{
  "email": "newstudent@mail.ugm.ac.id",
  "role": "mahasiswa",
  "name": "Jane Doe",              // Optional
  "nim": "22/123456/TK/12345",     // Optional (mahasiswa/alumni)
  "prodi": "Teknik Elektro"        // Optional (mahasiswa/alumni)
}
```

**Response Success (201):**
```json
{
  "message": "User pre-created successfully. User can now register to claim this account.",
  "user": {
    "id": "673...",
    "email": "newstudent@mail.ugm.ac.id",
    "role": "mahasiswa",
    "name": "Jane Doe",
    "nim": "22/123456/TK/12345",
    "prodi": "Teknik Elektro",
    "isClaimed": false
  }
}
```

**Response Error (400):**
```json
{
  "message": "Email sudah digunakan"
}
```

**Notes:**
- User dibuat dengan `isClaimed: false`, `isVerified: false`, tanpa password
- User bisa claim akun ini dengan register menggunakan email yang sama
- Setelah register, user verify OTP dan set password

---

### 2. Bulk Create Pre-Populated Users

**POST** `/api/users/bulk`

Admin bulk create users (import dari CSV/Excel).

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Required Role:** `admin`

**Request Body:**
```json
{
  "users": [
    {
      "email": "student1@mail.ugm.ac.id",
      "role": "mahasiswa",
      "name": "Student 1",
      "nim": "22/111111/TK/11111",
      "prodi": "Teknik Komputer"
    },
    {
      "email": "student2@mail.ugm.ac.id",
      "role": "mahasiswa",
      "name": "Student 2",
      "nim": "22/222222/TK/22222",
      "prodi": "Teknik Elektro"
    }
  ]
}
```

**Response Success (201):**
```json
{
  "message": "Bulk user creation completed",
  "summary": {
    "total": 2,
    "success": 2,
    "failed": 0
  },
  "results": {
    "success": [
      {
        "email": "student1@mail.ugm.ac.id",
        "user": { "id": "673...", "email": "student1@mail.ugm.ac.id", "role": "mahasiswa" }
      },
      {
        "email": "student2@mail.ugm.ac.id",
        "user": { "id": "674...", "email": "student2@mail.ugm.ac.id", "role": "mahasiswa" }
      }
    ],
    "failed": []
  }
}
```

**Notes:**
- Batch create untuk import data mahasiswa/dosen
- Jika ada error di salah satu user, yang lain tetap diproses
- Return summary success/failed

---

### 3. Get All Users

**GET** `/api/users`

Get semua users.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** `admin`, `dosen`

**Query Parameters:** None

**Response Success (200):**
```json
[
  {
    "_id": "673...",
    "email": "student@mail.ugm.ac.id",
    "name": "John Doe",
    "role": "mahasiswa",
    "nim": "22/504042/TK/55111",
    "prodi": "Teknik Komputer",
    "isVerified": true,
    "isClaimed": true,
    "createdAt": "2025-11-12T10:00:00.000Z",
    "updatedAt": "2025-11-12T10:00:00.000Z"
  },
  {
    "_id": "674...",
    "email": "dosen@ugm.ac.id",
    "name": "Dr. Prof",
    "role": "dosen",
    "isVerified": true,
    "isClaimed": true,
    "createdAt": "2025-11-12T11:00:00.000Z",
    "updatedAt": "2025-11-12T11:00:00.000Z"
  }
]
```

**Notes:**
- Password field tidak di-return
- NIM dan Prodi hanya untuk mahasiswa/alumni

---

### 4. Get User by ID

**GET** `/api/users/:id`

Get user detail by ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** `admin`, `dosen`

**URL Parameters:**
- `id` - User ID

**Response Success (200):**
```json
{
  "_id": "673...",
  "email": "student@mail.ugm.ac.id",
  "name": "John Doe",
  "role": "mahasiswa",
  "nim": "22/504042/TK/55111",
  "prodi": "Teknik Komputer",
  "isVerified": true,
  "isClaimed": true,
  "createdAt": "2025-11-12T10:00:00.000Z",
  "updatedAt": "2025-11-12T10:00:00.000Z"
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

---

### 5. Update User

**PATCH** `/api/users/:id`

Update user (role, name, email, nim, prodi, isVerified, isClaimed).

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Required Role:** `admin`

**URL Parameters:**
- `id` - User ID

**Request Body (semua field optional):**
```json
{
  "name": "Updated Name",
  "email": "newemail@mail.ugm.ac.id",
  "role": "alumni",
  "nim": "22/999999/TK/99999",
  "prodi": "Teknik Komputer",
  "isVerified": true,
  "isClaimed": true
}
```

**Response Success (200):**
```json
{
  "message": "User updated successfully",
  "user": {
    "id": "673...",
    "email": "newemail@mail.ugm.ac.id",
    "name": "Updated Name",
    "role": "alumni",
    "nim": "22/999999/TK/99999",
    "prodi": "Teknik Komputer",
    "isVerified": true,
    "isClaimed": true
  }
}
```

**Response Error (400):**
```json
{
  "message": "NIM sudah digunakan"
}
// or
{
  "message": "Email sudah digunakan"
}
```

**Notes:**
- Hanya admin yang bisa update user
- NIM harus unique (jika diubah)
- Email harus unique (jika diubah)

---

### 6. Delete User

**DELETE** `/api/users/:id`

Delete user.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Required Role:** `admin`

**URL Parameters:**
- `id` - User ID

**Response Success (200):**
```json
{
  "message": "User deleted",
  "user": {
    "_id": "673...",
    "email": "student@mail.ugm.ac.id",
    "name": "John Doe",
    "role": "mahasiswa"
  }
}
```

**Response Error (404):**
```json
{
  "message": "User not found"
}
```

---

## 📚 Capstones

Base Path: `/api/capstones`

### 1. Create Capstone

**POST** `/api/capstones`

Create capstone baru (dengan upload gambar hasil opsional).

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Required Role:** `admin`

**Request Body (multipart/form-data):**

```
judul: "Sistem Pengelolaan Sampah Terpadu"
kategori: "Pengolahan Sampah"              // Wajib: "Pengolahan Sampah", "Smart City", atau "Transportasi Ramah Lingkungan"
ketua: "673abc..."                           // User ID (alumni)
anggota: ["673def...", "673ghi..."]          // Array of User IDs (alumni)
dosen: "673xyz..."                           // User ID (dosen/admin)
abstrak: "Deskripsi lengkap capstone..."
proposal: file.pdf                           // Upload PDF proposal ke Cloudinary (max 10MB)
gambar: [file1, file2]                       // Optional, max 2 images (jpeg/jpg/png/gif/webp, max 5MB each)
```

**cURL Example:**
```bash
curl -X POST http://localhost:5000/api/capstones \
  -H "Authorization: Bearer {token}" \
  -F "judul=Sistem Pengelolaan Sampah Terpadu" \
  -F "kategori=Pengolahan Sampah" \
  -F "ketua=673abc..." \
  -F "dosen=673xyz..." \
  -F "abstrak=Deskripsi lengkap capstone..." \
  -F "proposal=@/path/to/proposal.pdf" \
  -F "gambar=@/path/to/image1.jpg" \
  -F "gambar=@/path/to/image2.png"
```

**JavaScript Example:**
```javascript
const formData = new FormData();
formData.append('judul', 'Sistem Transportasi Cerdas');
formData.append('kategori', 'Transportasi Ramah Lingkungan');
formData.append('ketua', ketuaId);
formData.append('dosen', dosenId);
formData.append('abstrak', 'Deskripsi lengkap...');
formData.append('proposal', pdfFile);    // PDF file upload
formData.append('gambar', imageFile1);   // Optional
formData.append('gambar', imageFile2);   // Optional

fetch('/api/capstones', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response Success (201):**
```json
{
  "_id": "675...",
  "judul": "Sistem Pengelolaan Sampah Terpadu",
  "kategori": "Pengolahan Sampah",
  "ketua": {
    "_id": "673abc...",
    "name": "Alumni Lead",
    "email": "alumni@mail.ugm.ac.id"
  },
  "anggota": [
    {
      "_id": "673def...",
      "name": "Alumni Member 1",
      "email": "alumni1@mail.ugm.ac.id"
    }
  ],
  "dosen": {
    "_id": "673xyz...",
    "name": "Dr. Dosen",
    "email": "dosen@ugm.ac.id"
  },
  "abstrak": "Deskripsi lengkap capstone...",
  "proposal": "https://res.cloudinary.com/.../proposal.pdf",
  "hasil": [
    "https://res.cloudinary.com/.../image1.jpg",
    "https://res.cloudinary.com/.../image2.png"
  ],
  "status": "Tersedia",
  "createdAt": "2025-11-12T10:00:00.000Z",
  "updatedAt": "2025-11-12T10:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "message": "Ketua must have role 'alumni'"
}
// or
{
  "message": "Dosen must have role 'dosen' or 'admin'"
}
// or
{
  "message": "Kategori harus: Pengolahan Sampah, Smart City, atau Transportasi Ramah Lingkungan"
}
// or
{
  "message": "Maksimal 2 gambar hasil"
}
// or
{
  "message": "Gagal upload gambar: File too large"
}
```

**Notes:**
- **Upload proposal PDF** ke Cloudinary (max 10MB, format: PDF)
- **Upload gambar hasil opsional** - bisa create capstone tanpa gambar
- **Kategori wajib** salah satu dari: "Pengolahan Sampah", "Smart City", "Transportasi Ramah Lingkungan"
- **Max 2 gambar** dengan format: jpeg, jpg, png, gif, webp
- **Max file size:** 5MB per gambar, 10MB untuk PDF
- **Proposal dan gambar di-upload ke Cloudinary** dan URL disimpan di database
- **Auto-optimization gambar:** Resize max 1200x1200, auto quality, WebP conversion
- Ketua & anggota harus role `alumni`
- Dosen harus role `dosen` atau `admin`
- Ketua TIDAK boleh ada di array anggota

---

### 2. Get Capstone Statistics

**GET** `/api/capstones/stats`

Get statistik capstone untuk admin dashboard.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Required Role:** `admin`

**Response Success (200):**
```json
{
  "totalCapstones": 50,
  "tersedia": 35,
  "tidakTersedia": 15,
  "fullyRequested": 8,
  "noRequests": 20,
  "partiallyRequested": 22
}
```

**Notes:**
- `fullyRequested`: Capstone dengan >= 3 pending request
- `noRequests`: Capstone tanpa request sama sekali
- `partiallyRequested`: Capstone dengan 1-2 pending request
- Hanya admin yang bisa akses endpoint ini

---

### 3. Get All Capstones

**GET** `/api/capstones`

Get semua capstones (public access).

**Headers:**
```
Authorization: Bearer {token}  // Optional
```

**Required Role:** None (public), optional auth for proposalUrl access

**Response Success (200):**
```json
[
  {
    "_id": "675...",
    "judul": "Sistem Pengelolaan Sampah Terpadu",
    "kategori": "Pengolahan Sampah",
    "ketua": {
      "_id": "673abc...",
      "name": "Alumni Lead",
      "email": "alumni@mail.ugm.ac.id",
      "role": "alumni"
    },
    "anggota": [
      {
        "_id": "673def...",
        "name": "Alumni Member 1",
        "email": "alumni1@mail.ugm.ac.id",
        "role": "alumni"
      }
    ],
    "dosen": {...},
    "hasil": [],
    "status": "Tersedia",
    "createdAt": "2025-11-12T10:00:00.000Z"
  }
]
```

**Notes:**
- `proposal` TIDAK ditampilkan di list (hanya di detail dengan access control)
- Ketua, anggota, dan dosen di-populate dengan data user
- Status: "Tersedia" atau "Tidak Tersedia"
  - "Tersedia": Capstone bisa dipilih
  - "Tidak Tersedia": Capstone sudah dipilih oleh group (approved) atau sudah ada >= 3 pending request
- Kategori: "Pengolahan Sampah", "Smart City", atau "Transportasi Ramah Lingkungan"
- `hasil` array kosong [] jika tidak ada gambar
- **Public Access**: Bisa diakses tanpa login, tapi `proposalUrl` hanya muncul untuk user dengan akses

---

### 4. Search Capstones

**GET** `/api/capstones/search`

Search dan filter capstones.

**Headers:**
```
Authorization: Bearer {token}  // Optional
```

**Required Role:** None (public), optional auth for proposalUrl access

**Query Parameters:**
- `judul` (optional) - Filter by judul (case-insensitive, partial match)
- `kategori` (optional) - Filter by kategori (exact match: "Pengolahan Sampah", "Smart City", atau "Transportasi Ramah Lingkungan")
- `status` (optional) - Filter by status (exact match: "Tersedia" atau "Tidak Tersedia")
- `sortBy` (optional) - Sort by: `terbaru` (newest first) or `judul` (A-Z)

**Example Request:**
```
GET /api/capstones/search?judul=sampah&kategori=Pengolahan Sampah&status=Tersedia&sortBy=terbaru
```

**Response Success (200):**
```json
[
  {
    "_id": "675...",
    "judul": "Sistem Pengelolaan Sampah Terpadu",
    "kategori": "Pengolahan Sampah",
    "ketua": {
      "_id": "673abc...",
      "name": "Alumni Lead",
      "email": "alumni@mail.ugm.ac.id",
      "role": "alumni"
    },
    "anggota": [...],
    "dosen": {...},
    "status": "Tersedia",
    "createdAt": "2025-11-12T10:00:00.000Z"
  }
]
```

**Notes:**
- Kategori harus exact match: "Pengolahan Sampah", "Smart City", atau "Transportasi Ramah Lingkungan"
- Status: "Tersedia" atau "Tidak Tersedia"
- Semua query parameters optional
- Default sorting: terbaru (newest first)
- linkProposal tidak ditampilkan di search results

---

### 4. Get Capstone Detail

**GET** `/api/capstones/:id`

Get detail capstone (dengan access control untuk linkProposal).

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** All authenticated users

**URL Parameters:**
- `id` - Capstone ID

**Response Success (200):**

**For Admin or Approved Group Members:**
```json
{
  "_id": "675...",
  "judul": "Sistem Pengelolaan Sampah Terpadu",
  "kategori": "Pengolahan Sampah",
  "ketua": {
    "_id": "673abc...",
    "name": "Alumni Lead",
    "email": "alumni@mail.ugm.ac.id",
    "role": "alumni"
  },
  "anggota": [...],
  "dosen": {...},
  "abstrak": "Deskripsi lengkap capstone...",
  "proposal": "https://res.cloudinary.com/.../proposal.pdf",  // ← Visible for admin/approved groups
  "hasil": [
    "https://res.cloudinary.com/.../image1.jpg"
  ],
  "status": "Tersedia",
  "createdAt": "2025-11-12T10:00:00.000Z",
  "updatedAt": "2025-11-12T10:00:00.000Z"
}
```

**For Others (non-admin, not in approved group):**
```json
{
  "_id": "675...",
  "judul": "Sistem Pengelolaan Sampah Terpadu",
  "kategori": "Pengolahan Sampah",
  "ketua": {...},
  "anggota": [...],
  "dosen": {...},
  "abstrak": "Deskripsi lengkap capstone...",
  // proposal NOT included
  "hasil": [],
  "status": "Tersedia",
  "createdAt": "2025-11-12T10:00:00.000Z",
  "updatedAt": "2025-11-12T10:00:00.000Z"
}
```

**Response Error (404):**
```json
{
  "message": "Capstone not found"
}
```

**Notes:**
- **`proposal` hanya visible untuk:**
  - Admin
  - Members dari group yang sudah approved untuk capstone ini
- Access control dilakukan di service layer
- `hasil` array kosong [] jika tidak ada gambar

---

### 5. Update Capstone

**PUT** `/api/capstones/:id`

Update capstone (termasuk update gambar hasil).

**Headers:**

```
Authorization: Bearer {admin_token}
Content-Type: multipart/form-data
```

**Required Role:** `admin`

**URL Parameters:**

- `id` - Capstone ID

**Request Body (multipart/form-data, semua field optional):**

```
judul: "Updated Judul"
kategori: "Smart City"                       // Harus salah satu dari 3 kategori
ketua: "673new..."
anggota: ["673x...", "673y..."]
dosen: "673z..."
abstrak: "Updated abstrak"
status: "Tidak Tersedia"                     // "Tersedia" atau "Tidak Tersedia"
proposal: newProposal.pdf                    // Upload PDF baru (auto replace yang lama)
gambar: [newFile1, newFile2]                 // Upload gambar baru (auto replace yang lama, max 2)
```

**JavaScript Example:**

```javascript
const formData = new FormData();
formData.append('judul', 'Updated Judul');
formData.append('proposal', newPdfFile);  // Replace proposal lama
formData.append('gambar', newImage1);     // Replace gambar lama
formData.append('gambar', newImage2);

fetch(`/api/capstones/${capstoneId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response Success (200):**

```json
{
  "_id": "675...",
  "judul": "Updated Judul",
  "kategori": "Smart City",
  "ketua": {...},
  "anggota": [...],
  "dosen": {...},
  "abstrak": "Updated abstrak",
  "proposal": "https://res.cloudinary.com/.../new-proposal.pdf",
  "hasil": [
    "https://res.cloudinary.com/.../new-image1.jpg",
    "https://res.cloudinary.com/.../new-image2.png"
  ],
  "status": "Tidak Tersedia",
  "updatedAt": "2025-11-12T15:00:00.000Z"
}
```

**Response Error (404):**

```json
{
  "message": "Capstone not found"
}
```

**Response Error (403):**

```json
{
  "message": "Not authorized to update this capstone"
}
```

**Notes:**

- Hanya admin yang bisa update
- **Upload proposal PDF baru otomatis delete proposal lama dari Cloudinary**
- **Upload gambar baru otomatis delete gambar lama dari Cloudinary**
- Ketua tidak boleh ada di array anggota
- Semua field optional - kirim hanya yang ingin diupdate

---

### 6. Delete Capstone

**DELETE** `/api/capstones/:id`

Delete capstone (auto delete gambar dari Cloudinary).

**Headers:**

```
Authorization: Bearer {admin_token}
```

**Required Role:** `admin`

**URL Parameters:**

- `id` - Capstone ID

**Response Success (200):**

```json
{
  "message": "Capstone deleted successfully",
  "capstone": {
    "_id": "675...",
    "judul": "Sistem Informasi Rumah Sakit",
    ...
  }
}
```

**Response Error (404):**

```json
{
  "message": "Capstone not found"
}
```

**Response Error (403):**

```json
{
  "message": "Not authorized to delete this capstone"
}
```

**Notes:**

- **Auto delete proposal PDF dan gambar hasil dari Cloudinary** sebelum delete capstone dari database
- Hanya admin yang bisa delete

---

## 👨‍👩‍👦 Groups

Base Path: `/api/groups`

### 1. Create Group

**POST** `/api/groups`

Create group mahasiswa.

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Required Role:** `admin`

**Request Body:**
```json
{
  "tema": "Healthcare Technology",
  "namaTim": "Team Alpha",
  "tahun": 2025,
  "ketua": "673abc...",                    // User ID (mahasiswa)
  "anggota": ["673def...", "673ghi..."],   // Array of User IDs (mahasiswa), max 3
  "dosen": "673jkl...",                     // User ID (dosen)
  "linkCVGabungan": "https://drive.google.com/cv"
}
```

**Response Success (201):**
```json
{
  "_id": "676...",
  "tema": "Healthcare Technology",
  "namaTim": "Team Alpha",
  "tahun": 2025,
  "ketua": {
    "_id": "673abc...",
    "name": "Student Lead",
    "email": "student@mail.ugm.ac.id",
    "role": "mahasiswa"
  },
  "anggota": [
    {
      "_id": "673def...",
      "name": "Student Member 1",
      "email": "student1@mail.ugm.ac.id",
      "role": "mahasiswa"
    }
  ],
  "dosen": {
    "_id": "673jkl...",
    "name": "Dr. Prof",
    "email": "dosen@ugm.ac.id",
    "role": "dosen"
  },
  "linkCVGabungan": "https://drive.google.com/cv",
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

**Response Error (400):**
```json
{
  "message": "Ketua tidak boleh ada di array anggota"
}
// or
{
  "message": "Maksimal anggota adalah 3 orang (tidak termasuk ketua)"
}
// or
{
  "message": "User dengan ID ... tidak ditemukan"
}
```

**Notes:**
- Ketua TIDAK boleh ada di array anggota (separated)
- Max members: 1 ketua + 3 anggota = 4 total
- Ketua dan anggota harus role `mahasiswa`
- Dosen harus role `dosen`

---

### 2. Get Group Detail

**GET** `/api/groups/:id`

Get detail group.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** All authenticated users (with access control)

**URL Parameters:**
- `id` - Group ID

**Response Success (200):**
```json
{
  "_id": "676...",
  "tema": "Healthcare Technology",
  "namaTim": "Team Alpha",
  "tahun": 2025,
  "ketua": {
    "_id": "673abc...",
    "name": "Student Lead",
    "email": "student@mail.ugm.ac.id",
    "role": "mahasiswa",
    "nim": "22/504042/TK/55111",
    "prodi": "Teknik Komputer"
  },
  "anggota": [
    {
      "_id": "673def...",
      "name": "Student Member 1",
      "email": "student1@mail.ugm.ac.id",
      "role": "mahasiswa",
      "nim": "22/123456/TK/12345",
      "prodi": "Teknik Elektro"
    }
  ],
  "dosen": {
    "_id": "673jkl...",
    "name": "Dr. Prof",
    "email": "dosen@ugm.ac.id",
    "role": "dosen"
  },
  "linkCVGabungan": "https://drive.google.com/cv",
  "capstone": {
    "_id": "675...",
    "judul": "Sistem Pengelolaan Sampah Terpadu",
    "kategori": "Pengolahan Sampah"
  },
  "status": "approved",
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

**Response Error (403):**
```json
{
  "message": "Anda tidak memiliki akses ke grup ini"
}
```

**Response Error (404):**
```json
{
  "message": "Group not found"
}
```

**Notes:**
- Hanya bisa diakses oleh: anggota group, admin, atau dosen
- Capstone di-populate jika group sudah pilih capstone

---

### 3. Update Group

**PUT** `/api/groups/:id`

Update group.

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Required Role:** `admin`

**URL Parameters:**
- `id` - Group ID

**Request Body (semua field optional):**
```json
{
  "tema": "Updated Theme",
  "namaTim": "New Team Name",
  "ketua": "673new...",
  "anggota": ["673x...", "673y..."],
  "dosen": "673z...",
  "linkCVGabungan": "https://drive.google.com/new-cv"
}
```

**Response Success (200):**
```json
{
  "message": "Group updated successfully",
  "group": {
    "_id": "676...",
    "tema": "Updated Theme",
    "namaTim": "New Team Name",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "message": "Ketua tidak boleh ada di array anggota"
}
```

---

### 4. Delete Group

**DELETE** `/api/groups/:id`

Delete group.

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Required Role:** `admin`

**URL Parameters:**
- `id` - Group ID

**Response Success (200):**
```json
{
  "message": "Group deleted",
  "group": {
    "_id": "676...",
    "tema": "Healthcare Technology",
    "namaTim": "Team Alpha"
  }
}
```

---

### 5. Choose Capstone

**POST** `/api/groups/:id/pilih`

Ketua group memilih capstone untuk tim.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `mahasiswa` (harus ketua group)

**URL Parameters:**
- `id` - Group ID

**Request Body:**
```json
{
  "capstoneId": "675...",
  "alasan": "Tim kami tertarik dengan project ini karena..."
}
```

**Response Success (200):**
```json
{
  "message": "Capstone chosen",
  "relation": {
    "_id": "677...",
    "group": "676...",
    "capstone": "675...",
    "alasan": "Tim kami tertarik dengan project ini karena...",
    "status": "pending",
    "createdAt": "2025-11-12T10:00:00.000Z"
  }
}
```

**Response Error (400):**
```json
{
  "message": "Group sudah memilih capstone"
}
// or
{
  "message": "Capstone not found"
}
```

**Response Error (403):**
```json
{
  "message": "Hanya ketua yang bisa memilih capstone"
}
```

**Notes:**
- Hanya ketua group yang bisa pilih capstone
- Status awal: `pending` (menunggu review alumni)
- Create Request document di database

---

## 📝 Reviews

Base Path: `/api/reviews`

### 1. Get Pending Reviews

**GET** `/api/reviews/pending`

Alumni get pending reviews untuk capstone mereka.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** `alumni`

**Response Success (200):**
```json
{
  "message": "Pending group reviews for your capstones",
  "pendingGroups": [
    {
      "_id": "676...",
      "tema": "Healthcare Technology",
      "namaTim": "Team Alpha",
      "ketua": {
        "_id": "673abc...",
        "name": "Student Lead",
        "email": "student@mail.ugm.ac.id"
      },
      "anggota": [...],
      "capstone": {
        "_id": "675...",
        "judul": "Sistem Informasi Rumah Sakit"
      },
      "status": "pending",
      "createdAt": "2025-11-12T10:00:00.000Z"
    }
  ],
  "count": 1
}
```

**Notes:**
- Hanya menampilkan group yang pilih capstone milik alumni ini
- Status `pending` (belum di-review)

---

### 2. Review Group

**POST** `/api/reviews/:id`

Alumni approve/reject group proposal.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** `alumni`

**URL Parameters:**
- `id` - Group ID

**Request Body:**
```json
{
  "status": "approved"
  // or "rejected"
}
```

**Response Success (200):**
```json
{
  "message": "Group approved",
  "group": {
    "_id": "676...",
    "tema": "Healthcare Technology",
    "namaTim": "Team Alpha",
    "status": "approved",
    ...
  }
}
```

**Response Error (400):**
```json
{
  "message": "Group belum memilih capstone"
}
// or
{
  "message": "Anda bukan pemilik capstone ini"
}
```

**Notes:**
- Hanya alumni yang memiliki capstone bisa review
- Status: `approved` atau `rejected`
- Update Request document status

---

## 🔔 Notifications

Base Path: `/api/notifications`

### 1. Create Notification

**POST** `/api/notifications`

Create notification untuk user.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Required Role:** All authenticated users

**Request Body:**
```json
{
  "userId": "673...",
  "type": "request",
  "message": "Group Alpha mengajukan proposal untuk capstone Anda",
  "data": {
    "groupId": "676...",
    "capstoneId": "675..."
  }
}
```

**Response Success (201):**
```json
{
  "_id": "678...",
  "userId": "673...",
  "type": "request",
  "message": "Group Alpha mengajukan proposal untuk capstone Anda",
  "data": {
    "groupId": "676...",
    "capstoneId": "675..."
  },
  "isRead": false,
  "createdAt": "2025-11-12T10:00:00.000Z"
}
```

**Notes:**
- Notification types: `request`, `approval`, `rejection`, `update`, etc.
- Data field untuk context tambahan (optional)

---

### 2. Get Notifications

**GET** `/api/notifications`

Get notifications untuk user yang sedang login.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** All authenticated users

**Response Success (200):**
```json
{
  "message": "User ID: 673...",
  "data": [
    {
      "_id": "678...",
      "userId": "673...",
      "type": "request",
      "message": "Group Alpha mengajukan proposal untuk capstone Anda",
      "data": {
        "groupId": "676...",
        "capstoneId": "675..."
      },
      "isRead": false,
      "createdAt": "2025-11-12T10:00:00.000Z"
    },
    {
      "_id": "679...",
      "userId": "673...",
      "type": "approval",
      "message": "Proposal Anda telah disetujui",
      "isRead": true,
      "createdAt": "2025-11-11T15:00:00.000Z"
    }
  ]
}
```

**Notes:**
- Sorted by newest first
- Menampilkan semua notifikasi user (read & unread)

---

### 3. Mark as Read

**PATCH** `/api/notifications/:id/read`

Mark notification sebagai sudah dibaca.

**Headers:**
```
Authorization: Bearer {token}
```

**Required Role:** All authenticated users

**URL Parameters:**
- `id` - Notification ID

**Response Success (200):**
```json
{
  "_id": "678...",
  "userId": "673...",
  "type": "request",
  "message": "Group Alpha mengajukan proposal untuk capstone Anda",
  "isRead": true,
  "updatedAt": "2025-11-12T11:00:00.000Z"
}
```

---

## 🔒 Authentication & Authorization

### Cookie-Based Authentication

Setiap request yang memerlukan authentication harus include salah satu:

**Option 1: Cookie (Auto-sent by browser)**
```
Cookie: token=eyJhbGc...
```

**Option 2: Authorization Header**
```
Authorization: Bearer eyJhbGc...
```

### Token Details

- **Type:** JWT (JSON Web Token)
- **Expiry:** 24 hours (86400 seconds)
- **Storage:** httpOnly cookie (XSS protection)
- **Payload:**
  ```json
  {
    "id": "user_id",
    "email": "user@mail.ugm.ac.id",
    "role": "mahasiswa",
    "iat": 1699876543,
    "exp": 1699962943
  }
  ```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|-------------|
| `admin` | Full access - manage users, capstones, groups |
| `dosen` | Read users, view groups, assign reviews |
| `alumni` | Create/manage capstones, review group proposals |
| `mahasiswa` | Join groups, choose capstones (ketua only) |
| `guest` | Read-only access (limited) |

### Error Responses

**401 Unauthorized:**
```json
{
  "message": "Token tidak ditemukan"
}
// or
{
  "message": "Token tidak valid"
}
```

**403 Forbidden:**
```json
{
  "message": "Akses ditolak. Role tidak memiliki izin."
}
```

---

## 📝 Notes

### Email Domain Validation

- `@mail.ugm.ac.id` → Auto-assigned role: `mahasiswa`
- `@ugm.ac.id` → Auto-assigned role: `dosen`
- Non-UGM domains: Only allowed for pre-created admin users

### Data Model Key Points

**Capstone:**
- Ketua (1 alumni) + Anggota (array alumni) - SEPARATED
- linkProposal with access control (admin + approved groups only)

**Group:**
- Ketua (1 mahasiswa) + Anggota (max 3 mahasiswa) - SEPARATED
- Max total members: 4 (1 ketua + 3 anggota)

**User:**
- NIM & Prodi fields only for mahasiswa/alumni
- Sparse unique index on NIM (allows null, unique when present)

### Frontend Integration

**Fetch API Example:**
```javascript
// With cookies (recommended)
fetch('/api/capstones', {
  credentials: 'include'  // Auto-send cookies
})

// With header
fetch('/api/capstones', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

**Axios Example:**
```javascript
// Global config
axios.defaults.withCredentials = true;

// Or per request
axios.get('/api/capstones', {
  withCredentials: true
})
```

---

**Last Updated:** November 13, 2025  
**Version:** 2.0  
**Base URL:** `http://localhost:5000/api`
