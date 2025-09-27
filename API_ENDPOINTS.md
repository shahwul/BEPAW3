# 📋 API Endpoints - BEPAW3 System

## 🎯 System Overview

**BEPAW3** adalah sistem manajemen capstone project yang menyediakan:
- **Authentication & User Management** (8 auth endpoints, 3 user endpoints)
- **Capstone Project Management** (7 capstone endpoints dengan file upload)
- **Group Management** (4 group endpoints untuk kolaborasi mahasiswa)
- **Review System** (2 review endpoints untuk persetujuan alumni)

**Total: 24 API Endpoints** dengan role-based access control dan Google Drive integration.

### ✨ **Key Features:**
- 🔐 **OTP-based Authentication** dengan Google OAuth support
- 📁 **Google Drive Integration** dengan Shared Drive compatibility
- 👥 **Group Management** dengan role-based access control
- ⭐ **Review System** dengan detail group information
- 🔍 **Advanced Search** dan filtering capabilities
- 🚀 **Memory-based File Upload** untuk optimal performance

---

## 🔐 Authentication Endpoints
**Base URL:** `/api/auth`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/register` | Register user baru dengan OTP verification | ❌ | - |
| `POST` | `/send-otp` | Request OTP untuk login (setelah password valid) | ❌ | - |
| `POST` | `/verify-otp` | Verifikasi OTP setelah register (auto login) | ❌ | - |
| `POST` | `/login` | Login dengan email dan password | ❌ | - |
| `POST` | `/refresh` | Refresh access token menggunakan refresh token | ❌ | - |
| `POST` | `/logout` | Logout dan invalidate refresh token | ❌ | - |
| `GET` | `/google` | Google OAuth login redirect | ❌ | - |
| `GET` | `/google/callback` | Google OAuth callback handler | ❌ | - |

---

## 👥 User Management Endpoints
**Base URL:** `/api/users`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/` | Mendapatkan semua user | ✅ | `admin` |
| `GET` | `/:id` | Mendapatkan user berdasarkan ID | ✅ | `admin` |
| `PATCH` | `/:id/role` | Update role user | ✅ | `admin` |

---

## 🎓 Capstone Management Endpoints
**Base URL:** `/api/capstones`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/` | Upload capstone dengan proposal file | ✅ | `alumni`, `admin` |
| `GET` | `/` | Mendapatkan semua capstone | ✅ | Any role |
| `GET` | `/:id` | Mendapatkan detail capstone | ✅ | Any role |
| `PUT` | `/:id` | Update capstone dengan optional proposal file | ✅ | `alumni`, `admin` |
| `DELETE` | `/:id` | Delete capstone | ✅ | `alumni`, `admin` |
| `GET` | `/:id/proposal` | Mendapatkan link proposal (admin only) | ✅ | `admin` |
| `GET` | `/search` | Search capstone berdasarkan judul dan kategori | ✅ | Any role |

---

## 👥 Group Management Endpoints
**Base URL:** `/api/groups`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/` | Create group baru | ✅ | `admin` |
| `DELETE` | `/:id` | Delete group | ✅ | `admin` |
| `POST` | `/:id/pilih` | Pilih capstone untuk group | ✅ | `mahasiswa` (ketua) |
| `GET` | `/:id` | Get group detail | ✅ | Group members |

---

## ⭐ Review Management Endpoints
**Base URL:** `/api/reviews`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/pending` | Get pending group reviews for alumni's capstones | ✅ | `alumni` |
| `POST` | `/:id` | Review group capstone selection | ✅ | `alumni` |

---

## 📝 Detailed API Documentation

### 🔐 Authentication Endpoints

#### 1. Register User
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (201):**
```json
{
  "message": "Registrasi berhasil. Silakan cek email untuk kode OTP",
  "email": "john@example.com",
  "needVerification": true
}
```
**Notes:**
- Role otomatis: `mahasiswa` untuk `@mail.ugm.ac.id`, `guest` untuk domain lainnya
- OTP dikirim ke email (berlaku 5 menit)

---

#### 2. Send OTP for Login
```
POST /api/auth/send-otp
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "message": "Password benar. Kode OTP telah dikirim ke email Anda",
  "email": "john@example.com",
  "needOTP": true
}
```

---

#### 3. Verify OTP (Register)
```
POST /api/auth/verify-otp
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```
**Response (200):**
```json
{
  "message": "OTP berhasil diverifikasi dan login otomatis",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mahasiswa",
    "isVerified": true
  }
}
```
**Cookies Set:**
- `accessToken`: HttpOnly cookie (15 minutes)
- `refreshToken`: HttpOnly cookie (7 days)

---

#### 4. Login with Password
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```
**Response (200):**
```json
{
  "message": "Login berhasil",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mahasiswa",
    "isVerified": true
  }
}
```
**Cookies Set:**
- `accessToken`: HttpOnly cookie (15 minutes)
- `refreshToken`: HttpOnly cookie (7 days)

---

#### 5. Refresh Token
```
POST /api/auth/refresh
```
**Request Body (Optional - Header-based auth only):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response (200):**
```json
{
  "message": "Token berhasil di-refresh",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mahasiswa",
    "isVerified": true
  }
}
```

---

#### 6. Logout
```
POST /api/auth/logout
```
**Request Body (Optional - Header-based auth only):**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
**Response (200):**
```json
{
  "message": "Logout berhasil"
}
```

---

#### 7. Google OAuth Login
```
GET /api/auth/google
```
**Response:** Redirect ke Google authorization page

---

#### 8. Google OAuth Callback
```
GET /api/auth/google/callback
```
**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "guest"
}
```

---

### 👥 User Management Endpoints

#### 1. Get All Users (Admin Only)
```
GET /api/users
```
**Headers:**
```
Authorization: Bearer <access-token>
```
**Response (200):**
```json
[
  {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "mahasiswa",
    "isVerified": true,
    "createdAt": "2024-09-24T10:30:00.000Z",
    "updatedAt": "2024-09-24T10:30:00.000Z"
  }
]
```

---

#### 2. Get User by ID (Admin Only)
```
GET /api/users/:id
```
**Headers:**
```
Authorization: Bearer <access-token>
```
**Response (200):**
```json
{
  "_id": "64f7b1234567890abcdef123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "mahasiswa",
  "isVerified": true,
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

---

#### 3. Update User Role (Admin Only)
```
PATCH /api/users/:id/role
```
**Headers:**
```
Authorization: Bearer <access-token>
```
**Request Body:**
```json
{
  "role": "admin"
}
```
**Response (200):**
```json
{
  "message": "Role updated",
  "user": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "isVerified": true,
    "createdAt": "2024-09-24T10:30:00.000Z",
    "updatedAt": "2024-09-24T10:30:00.000Z"
  }
}
```

---

## 🔑 Authentication Methods

### Cookie-based Authentication (Recommended)
- Otomatis mengirim cookies dengan setiap request
- HttpOnly cookies untuk keamanan maksimal
- Tidak perlu manual header management

```javascript
fetch('/api/users', {
  method: 'GET',
  credentials: 'include'
});
```

### Header-based Authentication
```javascript
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
```

---

## ⚡ HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created successfully |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (invalid/expired token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found (email/user not found) |
| `500` | Internal Server Error |

---

## 🛡️ Error Response Format

```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "hint": "Additional information (optional)"
}
```

### Common Error Codes
- `NO_TOKEN`: Access token tidak disertakan
- `TOKEN_EXPIRED`: Access token sudah expired
- `INVALID_TOKEN`: Access token tidak valid
- `INSUFFICIENT_ROLE`: Role tidak memiliki akses
- `NO_USER`: User tidak ditemukan di middleware auth

---

## 🎯 User Roles

| Role | Permissions |
|------|-------------|
| `admin` | Full access to all endpoints, can view proposal files, manage users, create/delete groups |
| `alumni` | Can create capstone projects with proposal uploads, view all capstones, review group selections |
| `mahasiswa` | Can view capstone projects, group leaders can choose capstones for their groups |
| `guest` | Basic access to view capstone projects |

### Role Assignment Rules
- **Register manual**:
  - `@mail.ugm.ac.id` → `mahasiswa`
  - Other domains → `guest`
- **Google OAuth**:
  - `@mail.ugm.ac.id` → `mahasiswa`
  - Other domains → `guest`
- **Admin role**: Only assignable by existing admin via API
- **Alumni role**: Manually assigned by admin for graduated students

### Access Permissions by Feature

#### Capstone Management
- **Alumni**: Can upload new capstone proposals (limit: 1 per alumni), update/delete own capstones
- **Admin**: Can view all capstone details including proposal files, update/delete any capstone
- **All logged users**: Can view capstone list and basic details (no proposal access), can search capstones

#### Group Management
- **Admin**: Can create and delete groups
- **Group Leader (mahasiswa)**: Can choose capstones for their group
- **Group Members**: Can view their group details
- **Non-members**: Cannot access group information

#### Review System
- **Alumni**: Can review and approve/reject group capstone selections
- **Other roles**: Cannot perform reviews
- **Admin**: Can view all capstone details including proposal files
- **All logged users**: Can view capstone list and basic details (no proposal access)

---

## 📧 OTP System

- **OTP Length**: 6 digits
- **OTP Expiry**: 5 minutes
- **OTP Type**: Random numeric code
- **Email Provider**: Configurable (Gmail/SMTP)

---

## 💾 File Upload System

### Proposal File Upload (Updated - Memory Storage)
- **Storage**: Google Drive (Service Account) via Google Shared Drive
- **Supported Formats**: PDF, DOC, DOCX
- **Max File Size**: 10MB
- **Upload Process**:
  1. File uploaded via multipart/form-data ke memory buffer
  2. Direct stream dari memory buffer ke Google Drive
  3. Google Drive file ID disimpan ke database
  4. Tidak ada file sementara di server disk
- **Access Control**: Hanya admin yang bisa generate shareable links
- **Folder**: Files disimpan di folder khusus Google Drive Shared Drive
- **Service Account**: Menggunakan env `GOOGLE_DRIVE_FOLDER_ID`
- **Shared Drive Support**: Full compatibility dengan Google Shared Drives

### File Upload Security & Performance
- **Memory Storage**: File diproses di memory untuk performa lebih baik
- **File Size Limit**: 10MB enforced by multer config
- **MIME Type Validation**: Validasi server-side
- **Access Restrictions**: Proposal hanya bisa diakses admin
- **Link Generation**: Otomatis shareable link untuk admin
- **No Disk I/O**: Tidak ada file sementara di disk
- **Container Ready**: Cocok untuk Docker/Kubernetes
- **Scalable**: Tidak bergantung pada shared disk

---

## 🔄 Token Management

### Access Token
- **Duration**: 15 minutes
- **Usage**: Untuk semua API calls
- **Auto-refresh**: Saat mendekati expiry

### Refresh Token
- **Duration**: 7 days
- **Usage**: Untuk refresh access token
- **Storage**: Secure client-side storage

### Auto-Refresh Flow
1. Client mendeteksi access token akan expired
2. Auto call `POST /api/auth/refresh`
3. Dapatkan access token baru
4. Retry API call

---

## 🚀 Getting Started

1. **Start Server**: `npm start`
2. **Base URL**: `http://localhost:3000`
3. **Register User**: `POST /api/auth/register`
4. **Verify OTP**: `POST /api/auth/verify-otp`
5. **Access Protected Routes**: Sertakan Authorization header atau enable cookies

### Frontend Examples

#### Upload Capstone with File (JavaScript)
```javascript
const formData = new FormData();
formData.append('judul', 'Sistem Manajemen Perpustakaan Digital');
formData.append('kategori', 'Web Development');
formData.append('deskripsi', 'Aplikasi web untuk mengelola buku dan peminjaman perpustakaan');
formData.append('proposal', fileInput.files[0]);

fetch('/api/capstones', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  },
  body: formData
})
.then(response => response.json())
.then(data => console.log('Capstone created:', data))
.catch(error => console.error('Error:', error));
```

#### Get Capstones List (JavaScript)
```javascript
fetch('/api/capstones', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  },
  credentials: 'include'
})
.then(response => response.json())
.then(capstones => {
  console.log('All capstones:', capstones);
})
.catch(error => console.error('Error:', error));
```

#### Admin Get Proposal Link (JavaScript)
```javascript
fetch(`/api/capstones/${capstoneId}/proposal`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminAccessToken
  }
})
.then(response => response.json())
.then(data => {
  console.log('Proposal URL:', data.proposalUrl);
  window.open(data.proposalUrl, '_blank');
})
.catch(error => console.error('Error:', error));
```

#### Update Capstone with Optional File (JavaScript)
```javascript
const formData = new FormData();
formData.append('judul', 'Updated Capstone Title');
formData.append('status', 'Diambil');
if (newProposalFile) {
  formData.append('proposal', newProposalFile);
}

fetch(`/api/capstones/${capstoneId}`, {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  },
  body: formData
})
.then(response => response.json())
.then(data => {
  console.log('Capstone updated:', data);
})
.catch(error => console.error('Error:', error));
```

#### Search Capstones (JavaScript)
```javascript
const searchParams = new URLSearchParams({
  judul: 'machine learning',
  kategori: 'AI'
});

fetch(`/api/capstones/search?${searchParams}`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
})
.then(response => response.json())
.then(results => {
  console.log('Search results:', results);
  results.forEach(capstone => {
    console.log(`Found: ${capstone.judul} - ${capstone.kategori}`);
  });
})
.catch(error => console.error('Error:', error));
```

#### Delete Capstone (JavaScript)
```javascript
fetch(`/api/capstones/${capstoneId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
})
.then(response => response.json())
.then(data => {
  console.log('Delete result:', data.message);
  console.log('Deleted capstone:', data.capstone);
})
.catch(error => console.error('Error:', error));
```

#### Create Group (JavaScript - Admin Only)
```javascript
const groupData = {
  namaKelompok: 'Kelompok Sistem Informasi',
  ketua: 'userId123',
  anggota: ['userId456', 'userId789']
};

fetch('/api/groups', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + adminAccessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(groupData)
})
.then(response => response.json())
.then(group => {
  console.log('Group created:', group);
})
.catch(error => console.error('Error:', error));
```

#### Choose Capstone (JavaScript - Group Leader)
```javascript
fetch(`/api/groups/${groupId}/pilih`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + ketuaAccessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    capstoneId: 'capstone123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Capstone chosen:', data.message);
  console.log('Updated group:', data.group);
})
.catch(error => console.error('Error:', error));
```

#### Get Pending Reviews (JavaScript - Alumni)
```javascript
fetch('/api/reviews/pending', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + alumniAccessToken
  }
})
.then(response => response.json())
.then(data => {
  console.log('Pending reviews:', data.message);
  console.log('Total pending:', data.count);
  data.pendingGroups.forEach(group => {
    console.log(`Group: ${group.namaKelompok}`);
    console.log(`Leader: ${group.ketua.name} (${group.ketua.email})`);
    console.log(`Capstone: ${group.capstoneDipilih.judul}`);
    console.log(`Members: ${group.anggota.map(m => m.name).join(', ')}`);
  });
})
.catch(error => console.error('Error:', error));
```

#### Review Group Selection (JavaScript - Alumni)
```javascript
fetch(`/api/reviews/${groupId}`, {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + alumniAccessToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    status: 'Disetujui'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Review result:', data.message);
  console.log('Updated group:', data.group);
  console.log('Final status:', data.group.status);
  console.log('Group members:', data.group.anggota.map(m => m.name).join(', '));
  console.log('Selected capstone:', data.group.capstoneDipilih.judul);
})
.catch(error => console.error('Error:', error));
```

---

## 📞 Support

Untuk pertanyaan dan bantuan API, silakan lihat dokumentasi utama atau hubungi tim pengembang.

