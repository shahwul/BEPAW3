# BEPAW3 API Documentation v2.0

## 🎯 System Overview

**BEPAW3** adalah sistem manajemen capstone project dengan **24 endpoints** tersebar di **6 modul utama**:

| **Module** | **Endpoints** | **Description** |
|------------|---------------|------------------|
| 🔐 **Auth** | 5 | Authentication system (Email/Password only) |
| 👤 **User** | 4 | User management for admin |
| 🎓 **Capstone** | 6 | Capstone project management (Alumni projects) |
| 👥 **Group** | 5 | Student group management |
| ⭐ **Review** | 2 | Alumni review system |
| 🔔 **Notification** | 3 | Email notification system |

### ✨ **Key Features:**

- 🔐 **OTP-based Authentication** dengan validasi domain UGM
- � **Link-based Proposal** untuk capstone (Google Drive, OneDrive, dll)
- 👥 **Group Management** dengan role-based access control
- ⭐ **Review System** dengan alasan pengajuan
- 🔔 **Email Notifications** dengan HTML templates
- 🔍 **Advanced Search** dan filtering capabilities

### 🔑 **Domain Restrictions:**
- ✅ `@mail.ugm.ac.id` → Mahasiswa
- ✅ `@ugm.ac.id` → Admin/Dosen
- ❌ Domain lain → Ditolak

---

## 📚 Table of Contents

1. [Authentication](#authentication-endpoints)
2. [Users](#user-endpoints)
3. [Capstone](#capstone-endpoints)
4. [Groups](#group-endpoints)
5. [Reviews](#review-endpoints)
6. [Notifications](#notification-endpoints)

---

## 🔐 Authentication Endpoints

### Authentication API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/auth/register` | Register dengan email UGM | ❌ | None |
| `POST` | `/api/auth/verify-otp` | Verify OTP code | ❌ | None |
| `POST` | `/api/auth/login` | Login dengan email UGM | ❌ | None |
| `POST` | `/api/auth/logout` | User logout | ✅ | Any |

---

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Response (201):**
```json
{
  "message": "Registrasi berhasil. Cek email untuk kode OTP",
  "email": "john@mail.ugm.ac.id",
  "needVerification": true
}
```

**Business Rules:**
- ✅ Email `@mail.ugm.ac.id` → role `mahasiswa`
- ✅ Email `@ugm.ac.id` → role `admin`
- ❌ Domain lain → Error: "Registrasi hanya diperbolehkan untuk email dengan domain @mail.ugm.ac.id atau @ugm.ac.id"
- OTP otomatis dikirim ke email
- OTP berlaku 5 menit

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "OTP berhasil diverifikasi",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Cookies Set:**
```
Set-Cookie: token=eyJhbGc...; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax
```

**Token Details:**
- **Duration**: 1 hari (86400 seconds)
- **Storage**: httpOnly cookie
- **Expired**: User harus login ulang

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login berhasil",
  "user": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa"
  },
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Cookies Set:**
```
Set-Cookie: token=eyJhbGc...; Max-Age=86400; Path=/; HttpOnly; SameSite=Lax
```

**Business Rules:**
- ✅ Email harus `@mail.ugm.ac.id` atau `@ugm.ac.id`
- ❌ Domain lain → Error
- Token berlaku 1 hari (24 jam)
- Expired → Harus login ulang

---

### 4. Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout berhasil"
}
```

**Cookies Cleared:**
```
Set-Cookie: token=; Max-Age=0
```

---

## 👤 User Endpoints

### User API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/api/users` | Get all users | ✅ | Admin |
| `GET` | `/api/users/:id` | Get user by ID | ✅ | Admin |
| `PUT` | `/api/users/:id/role` | Update user role | ✅ | Admin |
| `DELETE` | `/api/users/:id` | Delete user | ✅ | Admin |

---

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
[
  {
    "_id": "user_id",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  }
]
```

---

### 2. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "role": "mahasiswa",
  "isVerified": true
}
```

---

### 3. Update User Role

**Endpoint:** `PUT /api/users/:id/role`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Request Body:**
```json
{
  "role": "alumni"
}
```

**Available Roles:**
- `admin` - Administrator/Dosen
- `alumni` - Alumni (pembuat capstone)
- `mahasiswa` - Mahasiswa aktif
- `guest` - Guest (tidak digunakan jika validasi domain aktif)

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "role": "alumni"
}
```

---

### 4. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## 🎓 Capstone Endpoints

### Capstone API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/capstones` | Create capstone | ✅ | Admin |
| `GET` | `/api/capstones` | Get all capstones | ✅ | Any |
| `GET` | `/api/capstones/search` | Search capstones | ✅ | Any |
| `GET` | `/api/capstones/:id` | Get capstone detail | ✅ | Any |
| `PUT` | `/api/capstones/:id` | Update capstone | ✅ | Admin |
| `DELETE` | `/api/capstones/:id` | Delete capstone | ✅ | Admin |

---

### 1. Create Capstone (Admin Only)

**Endpoint:** `POST /api/capstones`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "judul": "Sistem Informasi Rumah Sakit",
  "kategori": "Web Development",
  "ketua": "alumni_user_id",
  "anggota": ["alumni_id1", "alumni_id2"],
  "dosen": "dosen_user_id",
  "abstrak": "Deskripsi lengkap capstone...",
  "linkProposal": "https://drive.google.com/file/d/xxx"
}
```

**Field Descriptions:**
- `judul` (required) - Judul capstone
- `kategori` (required) - Kategori capstone
- `ketua` (required) - User ID dengan role 'alumni'
- `anggota` (required) - Array user IDs dengan role 'alumni'
- `dosen` (required) - User ID dengan role 'admin'
- `abstrak` (required) - Deskripsi lengkap capstone
- `linkProposal` (optional) - Link ke proposal (Google Drive, OneDrive, Dropbox, dll)

**Response (201):**
```json
{
  "_id": "capstone_id",
  "judul": "Sistem Informasi Rumah Sakit",
  "kategori": "Web Development",
  "ketua": {
    "_id": "alumni_id",
    "name": "Alumni A",
    "email": "alumni@mail.ugm.ac.id"
  },
  "anggota": [
    {
      "_id": "alumni_id1",
      "name": "Alumni A",
      "email": "alumni@mail.ugm.ac.id"
    }
  ],
  "dosen": {
    "_id": "dosen_id",
    "name": "Dr. Dosen",
    "email": "dosen@ugm.ac.id"
  },
  "abstrak": "Deskripsi lengkap capstone...",
  "status": "Tersedia",
  "linkProposal": "https://drive.google.com/file/d/xxx"
}
```

**Validation:**
- ✅ Ketua harus role `alumni`
- ✅ Semua anggota harus role `alumni`
- ✅ Dosen harus role `admin`
- ✅ Ketua otomatis included dalam array anggota

---

### 2. Get All Capstones

**Endpoint:** `GET /api/capstones`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
[
  {
    "_id": "capstone_id",
    "judul": "Sistem Informasi RS",
    "kategori": "Web Development",
    "ketua": { ... },
    "anggota": [ ... ],
    "dosen": { ... },
    "abstrak": "...",
    "status": "Tersedia",
    "linkProposal": "https://drive.google.com/..."
  }
]
```

---

### 3. Search Capstones

**Endpoint:** `GET /api/capstones/search`

**Query Parameters:**
- `judul` (optional) - Search by title (case-insensitive)
- `kategori` (optional) - Filter by category

**Example:**
```
GET /api/capstones/search?judul=sistem&kategori=Web
```

**Response (200):**
```json
[
  {
    "_id": "capstone_id",
    "judul": "Sistem Informasi RS",
    "kategori": "Web Development",
    ...
  }
]
```

---

### 4. Get Capstone Detail

**Endpoint:** `GET /api/capstones/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "_id": "capstone_id",
  "judul": "Sistem Informasi RS",
  "kategori": "Web Development",
  "ketua": {
    "_id": "alumni_id",
    "name": "Alumni A",
    "email": "alumni@mail.ugm.ac.id"
  },
  "anggota": [ ... ],
  "dosen": { ... },
  "abstrak": "Deskripsi lengkap...",
  "status": "Tersedia",
  "linkProposal": "https://drive.google.com/file/d/xxx"
}
```

---

### 5. Update Capstone (Admin Only)

**Endpoint:** `PUT /api/capstones/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body (all optional):**
```json
{
  "judul": "New Title",
  "kategori": "New Category",
  "abstrak": "New Description",
  "status": "Dipilih",
  "ketua": "new_alumni_id",
  "anggota": ["alumni_id1", "alumni_id2"],
  "dosen": "new_dosen_id",
  "linkProposal": "https://onedrive.live.com/xxx"
}
```

**Response (200):**
```json
{
  "_id": "capstone_id",
  "judul": "New Title",
  "kategori": "New Category",
  "abstrak": "New Description",
  "status": "Dipilih",
  "linkProposal": "https://onedrive.live.com/xxx",
  ...
}
```

---

### 6. Delete Capstone (Admin Only)

**Endpoint:** `DELETE /api/capstones/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "message": "Capstone deleted successfully",
  "capstone": { ... }
}
```

---

## 👥 Group Endpoints

### Group API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/groups` | Create group | ✅ | Admin |
| `GET` | `/api/groups/:id` | Get group detail | ✅ | Anggota/Admin |
| `PUT` | `/api/groups/:id` | Update group | ✅ | Admin |
| `DELETE` | `/api/groups/:id` | Delete group | ✅ | Admin |
| `POST` | `/api/groups/:id/pilih` | Choose capstone | ✅ | Ketua |

---

### 1. Create Group (Admin Only)

**Endpoint:** `POST /api/groups`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "tema": "Sistem Informasi Kesehatan",
  "namaTim": "Tim Hebat 2025",
  "tahun": 2025,
  "ketua": "mahasiswa_id",                    // User role 'mahasiswa'
  "anggota": ["mhs_id1", "mhs_id2"],         // Array mahasiswa IDs
  "dosen": "dosen_id",                        // User role 'admin'
  "linkCVGabungan": "https://..."             // Optional
}
```

**Response (201):**
```json
{
  "_id": "group_id",
  "tema": "Sistem Informasi Kesehatan",
  "namaTim": "Tim Hebat 2025",
  "tahun": 2025,
  "ketua": {
    "_id": "mhs_id",
    "name": "Mahasiswa A",
    "email": "mhs@mail.ugm.ac.id"
  },
  "anggota": [ ... ],
  "dosen": {
    "_id": "dosen_id",
    "name": "Dr. Dosen",
    "email": "dosen@ugm.ac.id"
  },
  "linkCVGabungan": "https://..."
}
```

**Validation:**
- ✅ Ketua harus role `mahasiswa`
- ✅ Semua anggota harus role `mahasiswa`
- ✅ Maksimal 4 anggota (termasuk ketua)
- ✅ Dosen harus role `admin`
- ✅ Ketua otomatis included dalam array anggota

---

### 2. Get Group Detail

**Endpoint:** `GET /api/groups/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Access:** Anggota group atau Admin

**Response (200):**
```json
{
  "_id": "group_id",
  "tema": "Sistem Informasi Kesehatan",
  "namaTim": "Tim Hebat 2025",
  "tahun": 2025,
  "ketua": { ... },
  "anggota": [ ... ],
  "dosen": { ... },
  "linkCVGabungan": "https://...",
  "capstoneDipilih": [
    {
      "capstone": {
        "_id": "capstone_id",
        "judul": "Sistem RS",
        "kategori": "Web"
      },
      "alasan": "Kami tertarik dengan capstone ini karena...",
      "status": "Menunggu Review",
      "createdAt": "2025-11-12T..."
    }
  ]
}
```

---

### 3. Update Group (Admin Only)

**Endpoint:** `PUT /api/groups/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**Request Body (all optional):**
```json
{
  "tema": "New Theme",
  "namaTim": "New Name",
  "tahun": 2026,
  "linkCVGabungan": "https://new-link.com/...",
  "ketua": "new_ketua_id",
  "anggota": ["mhs_id1", "mhs_id2"],
  "dosen": "new_dosen_id"
}
```

**Response (200):**
```json
{
  "message": "Group updated successfully",
  "group": { ... }
}
```

---

### 4. Delete Group (Admin Only)

**Endpoint:** `DELETE /api/groups/:id`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Response (200):**
```json
{
  "message": "Group deleted",
  "group": { ... }
}
```

---

### 5. Choose Capstone (Ketua Only)

**Endpoint:** `POST /api/groups/:id/pilih`

**Headers:**
```
Authorization: Bearer {ketua_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "capstoneId": "capstone_id",
  "alasan": "Kami tertarik dengan capstone ini karena sesuai dengan minat tim kami di bidang kesehatan. Kami memiliki pengalaman dalam web development dan ingin mengembangkan sistem yang bermanfaat."
}
```

**Response (200):**
```json
{
  "message": "Capstone chosen",
  "relation": {
    "_id": "request_id",
    "group": "group_id",
    "capstone": "capstone_id",
    "alasan": "Kami tertarik dengan capstone ini...",
    "status": "Menunggu Review",
    "createdAt": "2025-11-12T..."
  }
}
```

**Validation:**
- ✅ Capstone harus status "Tersedia"
- ✅ Group belum pernah request capstone ini (kecuali ditolak)
- ✅ Group maksimal request 2 capstones
- ✅ Capstone maksimal direquest 3 groups (status "Menunggu Review")
- ✅ Alasan wajib diisi

**Notifications Sent:**
- 📧 Ke ketua group (konfirmasi)
- 📧 Ke alumni ketua capstone (notifikasi request baru)

---

## ⭐ Review Endpoints

### Review API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `GET` | `/api/reviews/pending` | Get pending reviews | ✅ | Alumni |
| `POST` | `/api/reviews/:requestId` | Review request | ✅ | Alumni |

---

### 1. Get Pending Reviews (Alumni Only)

**Endpoint:** `GET /api/reviews/pending`

**Headers:**
```
Authorization: Bearer {alumni_token}
```

**Response (200):**
```json
{
  "message": "Pending group reviews for your capstones",
  "pendingGroups": [
    {
      "requestId": "request_id",
      "group": {
        "_id": "group_id",
        "namaTim": "Tim Hebat",
        "tema": "Kesehatan",
        "tahun": 2025,
        "ketua": {
          "_id": "mhs_id",
          "name": "Mahasiswa A",
          "email": "mhs@mail.ugm.ac.id"
        },
        "anggota": [ ... ]
      },
      "capstone": {
        "_id": "capstone_id",
        "judul": "Sistem RS",
        "kategori": "Web",
        "abstrak": "..."
      },
      "alasan": "Kami tertarik dengan capstone ini karena...",
      "createdAt": "2025-11-12T..."
    }
  ],
  "count": 1
}
```

**Note:** Hanya menampilkan request untuk capstone dimana alumni adalah ketua

---

### 2. Review Request (Approve/Decline)

**Endpoint:** `POST /api/reviews/:requestId`

**Headers:**
```
Authorization: Bearer {alumni_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "Diterima"  // atau "Ditolak"
}
```

**Response (200):**
```json
{
  "message": "Group diterima",
  "group": {
    "requestId": "request_id",
    "group": { ... },
    "capstone": { ... },
    "status": "Diterima"
  }
}
```

**Business Logic:**

**Jika status = "Diterima":**
- ✅ Request → status "Diterima"
- ✅ Capstone → status "Dipilih"
- ✅ Semua request lain untuk capstone ini → status "Ditolak"
- 📧 Email ke ketua group (approved)

**Jika status = "Ditolak":**
- ✅ Request → status "Ditolak"
- ✅ Capstone tetap "Tersedia"
- 📧 Email ke ketua group (rejected)

**Validation:**
- ✅ Hanya alumni ketua capstone yang bisa review
- ✅ Status hanya boleh "Diterima" atau "Ditolak"

---

## 🔔 Notification Endpoints

### Notification API Summary

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| `POST` | `/api/notifications` | Create notification | ✅ | Any |
| `GET` | `/api/notifications` | Get user notifications | ✅ | Any |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✅ | Any |

---

### 1. Create Notification

**Endpoint:** `POST /api/notifications`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "user_id",
  "type": "capstone_request",
  "message": "Kelompok telah memilih capstone Anda",
  "data": {
    "groupId": "group_id",
    "capstoneId": "capstone_id"
  }
}
```

**Response (201):**
```json
{
  "_id": "notif_id",
  "userId": "user_id",
  "type": "capstone_request",
  "message": "Kelompok telah memilih capstone Anda",
  "data": { ... },
  "isRead": false,
  "createdAt": "2025-11-12T...",
  "updatedAt": "2025-11-12T..."
}
```

**Notification Types:**
- `notification` - General notification
- `capstone_request` - Request baru dari group
- `capstone_terima` - Request diterima
- `capstone_tolak` - Request ditolak

**Auto Email:**
Sistem otomatis mengirim email dengan HTML template yang sesuai dengan type

---

### 2. Get User Notifications

**Endpoint:** `GET /api/notifications`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "User ID: user_id",
  "data": [
    {
      "_id": "notif_id",
      "userId": "user_id",
      "type": "capstone_terima",
      "message": "Kelompok Anda telah direview dan statusnya: Diterima.",
      "data": {
        "groupId": "group_id",
        "status": "Diterima"
      },
      "isRead": false,
      "createdAt": "2025-11-12T...",
      "updatedAt": "2025-11-12T..."
    }
  ]
}
```

---

### 3. Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/:id/read`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "_id": "notif_id",
  "userId": "user_id",
  "type": "capstone_terima",
  "message": "...",
  "data": { ... },
  "isRead": true,
  "createdAt": "2025-11-12T...",
  "updatedAt": "2025-11-12T..."
}
```

---

## 🎯 Complete User Flows

### Flow 1: Admin Setup System

```
1. Admin Login
   POST /api/auth/login
   { "email": "admin@ugm.ac.id", "password": "..." }

2. Admin Update User Roles
   PUT /api/users/{userId}/role
   { "role": "alumni" }  // Set alumni
   
3. Admin Create Capstone (Alumni's past project)
   POST /api/capstones
   {
     "judul": "Sistem RS",
     "kategori": "Web",
     "ketua": "alumni_id",
     "anggota": ["alumni_id"],
     "dosen": "dosen_id",
     "abstrak": "...",
     "linkProposal": "https://drive.google.com/..."
   }
   
4. Admin Create Group (Current students)
   POST /api/groups
   {
     "ketua": "mahasiswa_id",
     "anggota": ["mahasiswa_id"],
     "dosen": "dosen_id",
     ...
   }
```

---

### Flow 2: Group Choose Capstone

```
1. Mahasiswa Register
   POST /api/auth/register
   { "email": "mhs@mail.ugm.ac.id", ... }
   
2. Verify OTP
   POST /api/auth/verify-otp
   { "email": "mhs@mail.ugm.ac.id", "otp": "123456" }
   
3. Mahasiswa Login (sebagai ketua)
   POST /api/auth/login
   
4. Lihat Available Capstones
   GET /api/capstones
   
5. Ketua Pilih Capstone
   POST /api/groups/{groupId}/pilih
   {
     "capstoneId": "capstone_id",
     "alasan": "Alasan memilih..."
   }
   
   → Notifikasi email ke alumni
```

---

### Flow 3: Alumni Review Request

```
1. Alumni Login
   POST /api/auth/login
   { "email": "alumni@mail.ugm.ac.id", ... }
   
2. Check Email Notification
   📧 Email: "Pengajuan Proposal Capstone Baru"
   
3. Get Pending Reviews
   GET /api/reviews/pending
   
   Response: List of groups with their reasons
   
4. Review Request
   POST /api/reviews/{requestId}
   { "status": "Diterima" }
   
   → Capstone status → "Dipilih"
   → Other requests → "Ditolak"
   → Email ke ketua group
   
5. Mahasiswa Get Notification
   GET /api/notifications
   
   → See "Proposal Diterima"
```

---

## 🔒 Role-Based Access Control

| Endpoint | Admin | Alumni | Mahasiswa | Guest |
|----------|-------|--------|-----------|-------|
| **Auth - Register/Login** | ✅ | ✅ | ✅ | ❌ |
| **User - Manage** | ✅ | ❌ | ❌ | ❌ |
| **Capstone - Create/Update/Delete** | ✅ | ❌ | ❌ | ❌ |
| **Capstone - View** | ✅ | ✅ | ✅ | ❌ |
| **Group - Create/Update/Delete** | ✅ | ❌ | ❌ | ❌ |
| **Group - View** | ✅ | ❌ | Anggota | ❌ |
| **Group - Choose Capstone** | ❌ | ❌ | Ketua | ❌ |
| **Review - View Pending** | ❌ | ✅ | ❌ | ❌ |
| **Review - Approve/Decline** | ❌ | ✅ | ❌ | ❌ |
| **Notifications - All** | ✅ | ✅ | ✅ | ❌ |

---

## 📧 Email Notifications

### Email Templates

Sistem otomatis mengirim email HTML dengan design yang berbeda berdasarkan type:

#### 1. **capstone_request** (Biru)
- 📋 Subject: "Pengajuan Proposal Capstone Baru"
- To: Alumni (ketua capstone)
- Content: Info group yang mengajukan + alasan
- Button: "Review Proposal"

#### 2. **capstone_terima** (Hijau)
- ✅ Subject: "Proposal Capstone Diterima"
- To: Mahasiswa (ketua group)
- Content: Konfirmasi approval
- Button: "Lihat Detail Project"

#### 3. **capstone_tolak** (Merah)
- ❌ Subject: "Proposal Capstone Ditolak"
- To: Mahasiswa (ketua group)
- Content: Info rejection
- Button: "Lihat Feedback"

### Email Configuration

Add to `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 📦 Data Models

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (required),
  role: String (enum: ["admin", "alumni", "mahasiswa", "guest"]),
  otp: String,
  otpExpiry: Date,
  isVerified: Boolean,
  refreshToken: String,
  refreshTokenExpiry: Date
}
```

### Capstone
```javascript
{
  _id: ObjectId,
  judul: String (required),
  kategori: String (required),
  ketua: ObjectId → User (alumni),
  anggota: [ObjectId] → User (alumni),
  dosen: ObjectId → User (admin),
  abstrak: String (required),
  status: String (enum: ["Tersedia", "Dipilih"]),
  linkProposal: String (optional)
}
```

### Group
```javascript
{
  _id: ObjectId,
  tema: String (required),
  namaTim: String (required),
  tahun: Number (required),
  ketua: ObjectId → User (mahasiswa),
  anggota: [ObjectId] → User (mahasiswa),
  dosen: ObjectId → User (admin),
  linkCVGabungan: String
}
```

### Request
```javascript
{
  _id: ObjectId,
  group: ObjectId → Group,
  capstone: ObjectId → Capstone,
  alasan: String (required),
  status: String (enum: ["Menunggu Review", "Diterima", "Ditolak"]),
  createdAt: Date
}
```

### Notification
```javascript
{
  _id: ObjectId,
  userId: ObjectId → User,
  type: String,
  message: String,
  data: Object,
  isRead: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Getting Started

1. **Clone repository**
2. **Install dependencies:** `npm install`
3. **Setup .env:**
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/bepaw3
   JWT_SECRET=your-secret-key
   REFRESH_TOKEN_SECRET=your-refresh-secret
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   FRONTEND_URL=http://localhost:3000
   ```
4. **Run:** `npm run dev`

---

## 📝 Notes

- ✅ Login hanya untuk domain `@mail.ugm.ac.id` dan `@ugm.ac.id`
- ✅ Google OAuth dihapus
- ✅ File upload dihapus, proposal menggunakan link (Google Drive, OneDrive, Dropbox, dll)
- ✅ Simple single-token authentication (1 day expiry)
- ✅ Tidak ada refresh token mechanism (expired = login ulang)
- ✅ Token disimpan di httpOnly cookie (secure)
- ✅ Capstone dibuat oleh admin dengan data alumni
- ✅ Group dibuat oleh admin dengan data mahasiswa aktif
- ✅ Group bisa request max 2 capstones
- ✅ Capstone bisa direquest max 3 groups
- ✅ Alasan wajib diisi saat choose capstone
- ✅ Email otomatis terkirim saat events penting

---

**Last Updated:** November 12, 2025  
**Version:** 2.2 (Simplified)  
**Total Endpoints:** 23
