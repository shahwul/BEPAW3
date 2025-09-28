# BEPAW3 API Documentation

## 🎯 System Overview

**BEPAW3** adalah sistem manajemen capstone project yang menyediakan **27 endpoints** tersebar di **6 modul utama**:

| **Module** | **Endpoints** | **Description** |
|------------|---------------|------------------|
| 🔐 **Auth** | 7 | Authentication & authorization system |
| 👤 **User** | 4 | User management for admin |
| 🎓 **Capstone** | 7 | Capstone project management |
| 👥 **Group** | 4 | Student group management |
| ⭐ **Review** | 2 | Alumni review system |
| 🔔 **Notification** | 3 | Real-time notification system |

**Total: 27 endpoints** dengan role-based access control dan Google Drive integration.

### ✨ **Key Features:**

- 🔐 **OTP-based Authentication** dengan Google OAuth support
- 📁 **Google Drive Integration** dengan Shared Drive compatibility
- 👥 **Group Management** dengan role-based access control
- ⭐ **Review System** dengan detail group information
- 🔔 **Real-time Notifications** untuk status updates
- 🔍 **Advanced Search** dan filtering capabilities
- 🚀 **Memory-based File Upload** untuk optimal performance

---

## 🔐 Authentication Endpoints

### 📋 **Authentication API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `POST` | `/api/auth/register` | User registration | ❌ | None |
| `POST` | `/api/auth/verify-otp` | Verify OTP code | ❌ | None |
| `POST` | `/api/auth/login` | User login | ❌ | None |
| `POST` | `/api/auth/refresh` | Refresh access token | 🔄 | Refresh Token |
| `POST` | `/api/auth/logout` | User logout | ✅ | Any |
| `GET` | `/api/auth/google` | Google OAuth login | ❌ | None |
| `GET` | `/api/auth/google/callback` | Google OAuth callback | 🔄 | OAuth Flow |

---

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Authentication:** None required

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Request Headers:**

```
Content-Type: application/json
```

**Response (201 - Success):**

```json
{
  "message": "Registrasi berhasil. Cek email untuk kode OTP",
  "email": "john@mail.ugm.ac.id",
  "needVerification": true
}
```

**Response (400 - Error):**

```json
{
  "message": "Email sudah terdaftar"
}
```

**Business Rules:**

- Email `@mail.ugm.ac.id` → role `mahasiswa`
- Email domain lain → role `guest`
- Password minimum 6 karakter
- OTP otomatis dikirim ke email

---

### 2. Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Authentication:** None required

**Request Body:**

```json
{
  "email": "john@mail.ugm.ac.id",
  "otp": "123456"
}
```

**Request Headers:**

```
Content-Type: application/json
```

**Response (200 - Success):**

```json
{
  "message": "OTP berhasil diverifikasi",
  "user": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

**Cookies Set:**

- `accessToken` (HttpOnly, 15 minutes)
- `refreshToken` (HttpOnly, 7 days)

**Response (400 - Error):**

```json
{
  "message": "OTP tidak valid atau sudah expired"
}
```

---

### 3. Login

**Endpoint:** `POST /api/auth/login`

**Authentication:** None required

**Request Body:**

```json
{
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Response (200 - Success):**

```json
{
  "message": "Login berhasil",
  "user": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

---

### 4. Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Authentication:** Refresh Token (Cookie or Body)

**Request Body (Optional):**

```json
{
  "refreshToken": "your-refresh-token-here"
}
```

**Request Headers:**

```
Cookie: refreshToken=your-refresh-token-here
```

**Response (200 - Success):**

```json
{
  "message": "Token refreshed",
  "user": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "role": "mahasiswa"
  },
  "tokenType": "Bearer",
  "expiresIn": "15m"
}
```

---

### 5. Logout

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Bearer Token or Cookie

**Request Headers:**

```
Authorization: Bearer <access-token>
Cookie: accessToken=<token>; refreshToken=<refresh-token>
```

**Response (200 - Success):**

```json
{
  "message": "Logout berhasil"
}
```

**Cookies Cleared:**

- `accessToken` 
- `refreshToken`

---

### 6. Google OAuth

**Endpoint:** `GET /api/auth/google`

**Authentication:** None required

**Response:** Redirect to Google OAuth consent screen

---

### 7. Google OAuth Callback

**Endpoint:** `GET /api/auth/google/callback`

**Authentication:** Google OAuth flow

**Response (200 - Success):**

```json
{
  "token": "jwt-token-here",
  "role": "mahasiswa"
}
```

---

## 👤 User Management Endpoints

### 📋 **User Management API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `GET` | `/api/users` | Get all users | ✅ | admin |
| `GET` | `/api/users/:id` | Get user by ID | ✅ | admin |
| `PATCH` | `/api/users/:id/role` | Update user role | ✅ | admin |
| `DELETE` | `/api/users/:id` | Delete user | ✅ | admin |

---

### 1. Get All Users

**Endpoint:** `GET /api/users`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
```

**Response (200 - Success):**

```json
[
  {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true,
    "createdAt": "2024-09-24T10:30:00.000Z"
  },
  {
    "_id": "64f7b1234567890abcdef124",
    "name": "Dr. Alumni",
    "email": "alumni@mail.ugm.ac.id",
    "role": "alumni",
    "isVerified": true,
    "createdAt": "2024-09-20T08:15:00.000Z"
  }
]
```

**Response (403 - Forbidden):**

```json
{
  "message": "Insufficient role",
  "code": "INSUFFICIENT_ROLE"
}
```

---

### 2. Get User by ID

**Endpoint:** `GET /api/users/:id`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
```

**Response (200 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef123",
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "role": "mahasiswa",
  "isVerified": true,
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

**Response (404 - Not Found):**

```json
{
  "message": "User tidak ditemukan"
}
```

---

### 3. Update User Role

**Endpoint:** `PATCH /api/users/:id/role`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "role": "alumni"
}
```

**Valid Roles:** `mahasiswa`, `alumni`, `admin`, `guest`

**Response (200 - Success):**

```json
{
  "message": "Role updated",
  "user": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "alumni",
    "isVerified": true,
    "updatedAt": "2024-09-24T11:00:00.000Z"
  }
}
```

---

### 4. Delete User

**Endpoint:** `DELETE /api/users/:id`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
```

**Response (200 - Success):**

```json
{
  "message": "User berhasil dihapus"
}
```

---

## 🎓 Capstone Management Endpoints

### 📋 **Capstone Management API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `POST` | `/api/capstones` | Create new capstone | ✅ | alumni, admin |
| `GET` | `/api/capstones/search` | Search capstones | ✅ | Any |
| `GET` | `/api/capstones` | Get all capstones | ✅ | Any |
| `GET` | `/api/capstones/:id` | Get capstone detail | ✅ | Any |
| `PUT` | `/api/capstones/:id` | Update capstone | ✅ | alumni (owner), admin |
| `GET` | `/api/capstones/:id/proposal` | Get proposal link | ✅ | admin |
| `DELETE` | `/api/capstones/:id` | Delete capstone | ✅ | alumni (owner), admin |

---

### 1. Create Capstone

**Endpoint:** `POST /api/capstones`

**Authentication:** Bearer Token

**Required Role:** `alumni`, `admin`

**Request Headers:**

```
Authorization: Bearer <alumni-access-token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```javascript
const formData = new FormData();
formData.append('judul', 'Machine Learning untuk Prediksi Cuaca');
formData.append('kategori', 'AI');
formData.append('deskripsi', 'Sistem prediksi cuaca menggunakan neural network');
formData.append('proposal', proposalFile); // File (PDF, DOC, DOCX)
```

**File Requirements:**
- Max size: 10MB
- Allowed types: PDF, DOC, DOCX
- Stored in Google Drive

**Response (201 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef111",
  "judul": "Machine Learning untuk Prediksi Cuaca",
  "kategori": "AI",
  "deskripsi": "Sistem prediksi cuaca menggunakan neural network",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "Dr. Alumni",
    "email": "alumni@mail.ugm.ac.id"
  },
  "proposalUrl": "https://drive.google.com/file/d/...",
  "status": "Tersedia",
  "createdAt": "2024-09-24T10:30:00.000Z"
}
```

---

### 2. Search Capstones

**Endpoint:** `GET /api/capstones/search`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user

**Request Headers:**

```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `judul` (optional): Search by title
- `kategori` (optional): Filter by category

**Example Request:**

```
GET /api/capstones/search?judul=AI&kategori=Machine Learning
```

**Response (200 - Success):**

```json
[
  {
    "_id": "64f7b1234567890abcdef111",
    "judul": "AI-Powered Learning System",
    "kategori": "Machine Learning",
    "deskripsi": "Intelligent tutoring system",
    "alumni": {
      "name": "Dr. Alumni",
      "email": "alumni@mail.ugm.ac.id"
    },
    "status": "Tersedia",
    "createdAt": "2024-09-24T10:30:00.000Z"
  }
]
```

---

### 3. Get All Capstones

**Endpoint:** `GET /api/capstones`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user

**Request Headers:**

```
Authorization: Bearer <access-token>
```

**Response (200 - Success):**

```json
[
  {
    "_id": "64f7b1234567890abcdef111",
    "judul": "Machine Learning untuk Prediksi Cuaca",
    "kategori": "AI",
    "deskripsi": "Sistem prediksi cuaca menggunakan neural network",
    "alumni": {
      "_id": "64f7b1234567890abcdef456",
      "name": "Dr. Alumni",
      "email": "alumni@mail.ugm.ac.id"
    },
    "status": "Tersedia",
    "createdAt": "2024-09-24T10:30:00.000Z"
  }
]
```

**Status Values:** `Tersedia`, `Dipilih`, `Selesai`

---

### 4. Get Capstone Detail

**Endpoint:** `GET /api/capstones/:id`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user

**Request Headers:**

```
Authorization: Bearer <access-token>
```

**Response (200 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef111",
  "judul": "Machine Learning untuk Prediksi Cuaca",
  "kategori": "AI", 
  "deskripsi": "Sistem prediksi cuaca menggunakan neural network dengan teknologi deep learning dan data historis cuaca.",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "Dr. Alumni",
    "email": "alumni@mail.ugm.ac.id"
  },
  "proposalUrl": "https://drive.google.com/file/d/...",
  "status": "Tersedia",
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

---

### 5. Update Capstone

**Endpoint:** `PUT /api/capstones/:id`

**Authentication:** Bearer Token

**Required Role:** `alumni` (owner only), `admin`

**Request Headers:**

```
Authorization: Bearer <alumni-access-token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**

```javascript
const formData = new FormData();
formData.append('judul', 'Updated Title');
formData.append('kategori', 'Updated Category');
formData.append('deskripsi', 'Updated description');
formData.append('proposal', newProposalFile); // Optional
```

**Response (200 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef111",
  "judul": "Updated Title",
  "kategori": "Updated Category",
  "deskripsi": "Updated description",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "Dr. Alumni",
    "email": "alumni@mail.ugm.ac.id"
  },
  "proposalUrl": "https://drive.google.com/file/d/...",
  "status": "Tersedia",
  "updatedAt": "2024-09-24T11:00:00.000Z"
}
```

---

### 6. Get Proposal Link

**Endpoint:** `GET /api/capstones/:id/proposal`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
```

**Response (200 - Success):**

```json
{
  "proposalUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
  "fileName": "ML_Weather_Prediction_Proposal.pdf",
  "uploadedAt": "2024-09-24T10:30:00.000Z"
}
```

---

### 7. Delete Capstone

**Endpoint:** `DELETE /api/capstones/:id`

**Authentication:** Bearer Token

**Required Role:** `alumni` (owner only), `admin`

**Request Headers:**

```
Authorization: Bearer <alumni-access-token>
```

**Response (200 - Success):**

```json
{
  "message": "Capstone berhasil dihapus"
}
```

**Business Rules:**
- Cannot delete if status is "Dipilih" (already selected by group)
- Alumni can only delete their own capstones
- Admin can delete any capstone

---

## 👥 Group Management Endpoints

### 📋 **Group Management API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `POST` | `/api/groups` | Create new group | ✅ | admin |
| `DELETE` | `/api/groups/:id` | Delete group | ✅ | admin |
| `POST` | `/api/groups/:id/pilih` | Choose capstone | ✅ | mahasiswa (leader) |
| `GET` | `/api/groups/:id` | Get group detail | ✅ | Group member, admin |

---

### 1. Create Group

**Endpoint:** `POST /api/groups`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "namaKelompok": "Kelompok Sistem Informasi A",
  "ketua": "64f7b1234567890abcdef123",
  "anggota": [
    "64f7b1234567890abcdef123",
    "64f7b1234567890abcdef124", 
    "64f7b1234567890abcdef125"
  ]
}
```

**Response (201 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef999",
  "namaKelompok": "Kelompok Sistem Informasi A",
  "ketua": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "anggota": [
    {
      "_id": "64f7b1234567890abcdef123",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    },
    {
      "_id": "64f7b1234567890abcdef124",
      "name": "Jane Smith",
      "email": "jane@mail.ugm.ac.id"
    }
  ],
  "status": "Belum Pilih Capstone",
  "createdAt": "2024-09-24T10:30:00.000Z"
}
```

**Business Rules:**
- Ketua must be included in anggota array (automatically handled)
- All members must have role "mahasiswa" 
- Maximum 4 members per group
- Ketua and anggota use ObjectId format
- No duplicate members (automatically deduplicated)

---

### 2. Delete Group

**Endpoint:** `DELETE /api/groups/:id`

**Authentication:** Bearer Token

**Required Role:** `admin`

**Request Headers:**

```
Authorization: Bearer <admin-access-token>
```

**Response (200 - Success):**

```json
{
  "message": "Group berhasil dihapus"
}
```

**Business Rules:**
- Cannot delete group if capstone selection is already approved
- Cannot delete group with status "Disetujui"

---

### 3. Choose Capstone

**Endpoint:** `POST /api/groups/:id/pilih`

**Authentication:** Bearer Token

**Required Role:** `mahasiswa` (must be group leader)

**Request Headers:**

```
Authorization: Bearer <ketua-access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "capstoneId": "64f7b1234567890abcdef111"
}
```

**Response (200 - Success):**

```json
{
  "message": "Capstone berhasil dipilih",
  "group": {
    "_id": "64f7b1234567890abcdef999",
    "namaKelompok": "Kelompok Sistem Informasi A",
    "ketua": {
      "_id": "64f7b1234567890abcdef123",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    },
    "anggota": [...],
    "capstoneDipilih": {
      "_id": "64f7b1234567890abcdef111",
      "judul": "Machine Learning untuk Prediksi Cuaca",
      "kategori": "AI",
      "alumni": {
        "name": "Dr. Alumni",
        "email": "alumni@mail.ugm.ac.id"
      }
    },
    "status": "Menunggu Review",
    "updatedAt": "2024-09-24T11:00:00.000Z"
  }
}
```

**Side Effects:**
- Group status changes to "Menunggu Review"
- Notification sent to capstone owner (alumni)
- Capstone becomes unavailable for other groups

---

### 4. Get Group Detail

**Endpoint:** `GET /api/groups/:id`

**Authentication:** Bearer Token

**Required Role:** Group member or Admin

**Request Headers:**

```
Authorization: Bearer <member-access-token>
```

**Response (200 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef999",
  "namaKelompok": "Kelompok Sistem Informasi A",
  "ketua": {
    "_id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "anggota": [
    {
      "_id": "64f7b1234567890abcdef123",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    }
  ],
  "capstoneDipilih": {
    "_id": "64f7b1234567890abcdef111",
    "judul": "Machine Learning untuk Prediksi Cuaca",
    "kategori": "AI",
    "alumni": {
      "name": "Dr. Alumni",
      "email": "alumni@mail.ugm.ac.id"
    }
  },
  "status": "Disetujui",
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T12:00:00.000Z"
}
```

**Access Control:**
- Only group members can view their group details
- Admin can view any group details
- Returns 403 if user is not group member or admin

---

## ⭐ Review Management Endpoints

### 📋 **Review Management API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `GET` | `/api/reviews/pending` | Get pending reviews | ✅ | alumni |
| `POST` | `/api/reviews/:id` | Review group selection | ✅ | alumni (capstone owner) |

---

### 1. Get Pending Reviews

**Endpoint:** `GET /api/reviews/pending`

**Authentication:** Bearer Token

**Required Role:** `alumni`

**Request Headers:**

```
Authorization: Bearer <alumni-access-token>
```

**Response (200 - Success):**

```json
{
  "message": "Pending group reviews for your capstones",
  "pendingGroups": [
    {
      "_id": "64f7b1234567890abcdef999",
      "namaKelompok": "Kelompok Sistem Informasi A",
      "ketua": {
        "_id": "64f7b1234567890abcdef123",
        "name": "John Doe",
        "email": "john@mail.ugm.ac.id"
      },
      "anggota": [
        {
          "_id": "64f7b1234567890abcdef123",
          "name": "John Doe",
          "email": "john@mail.ugm.ac.id"
        }
      ],
      "capstoneDipilih": {
        "_id": "64f7b1234567890abcdef111",
        "judul": "Machine Learning untuk Prediksi Cuaca",
        "kategori": "AI"
      },
      "status": "Menunggu Review",
      "createdAt": "2024-09-24T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

**Business Rules:**
- Only shows groups that selected alumni's own capstones
- Only groups with status "Menunggu Review"
- Includes complete group member information

---

### 2. Review Group

**Endpoint:** `POST /api/reviews/:id`

**Authentication:** Bearer Token

**Required Role:** `alumni` (capstone owner only)

**Request Headers:**

```
Authorization: Bearer <alumni-access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "status": "Disetujui"
}
```

**Valid Status Values:**
- `"Disetujui"` - Approve group selection
- `"Ditolak"` - Reject group selection

**Response (200 - Success - Approved):**

```json
{
  "message": "Group berhasil disetujui",
  "group": {
    "_id": "64f7b1234567890abcdef999",
    "namaKelompok": "Kelompok Sistem Informasi A",
    "ketua": {
      "_id": "64f7b1234567890abcdef123",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    },
    "anggota": [...],
    "capstoneDipilih": {
      "_id": "64f7b1234567890abcdef111",
      "judul": "Machine Learning untuk Prediksi Cuaca",
      "kategori": "AI"
    },
    "status": "Disetujui",
    "reviewedAt": "2024-09-24T12:00:00.000Z"
  }
}
```

**Side Effects:**
- If approved: Group status → "Disetujui", Capstone status → "Dipilih"
- If rejected: Group status → "Ditolak", Capstone becomes available again
- Notification sent to group leader
- Other pending groups for same capstone automatically rejected

---

## 🔔 Notification Management Endpoints

### 📋 **Notification Management API Endpoints**

| **Method** | **Endpoint** | **Description** | **Auth Required** | **Role** |
|------------|--------------|-----------------|-------------------|----------|
| `POST` | `/api/notifications` | Create notification | ✅ | Any |
| `GET` | `/api/notifications` | Get user notifications | ✅ | Any |
| `PATCH` | `/api/notifications/:id/read` | Mark as read | ✅ | Any (owner only) |

---

### 1. Create Notification

**Endpoint:** `POST /api/notifications`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user

**Request Headers:**

```
Authorization: Bearer <access-token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "userId": "64f7b1234567890abcdef123",
  "type": "CAPSTONE_REVIEW",
  "message": "Your capstone selection has been reviewed",
  "data": {
    "groupId": "64f7b1234567890abcdef999",
    "capstoneId": "64f7b1234567890abcdef111",
    "status": "Disetujui"
  }
}
```

**Notification Types:**
- `CAPSTONE_REVIEW` - Review result notification
- `GROUP_CREATED` - New group creation
- `SYSTEM_ANNOUNCEMENT` - System-wide announcements
- `STATUS_UPDATE` - Status change notifications

**Response (201 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef888",
  "userId": "64f7b1234567890abcdef123",
  "type": "CAPSTONE_REVIEW",
  "message": "Your capstone selection has been reviewed",
  "data": {
    "groupId": "64f7b1234567890abcdef999",
    "capstoneId": "64f7b1234567890abcdef111",
    "status": "Disetujui"
  },
  "isRead": false,
  "createdAt": "2024-09-24T12:00:00.000Z"
}
```

---

### 2. Get User Notifications

**Endpoint:** `GET /api/notifications`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user

**Request Headers:**

```
Authorization: Bearer <access-token>
```

**Response (200 - Success):**

```json
[
  {
    "_id": "64f7b1234567890abcdef888",
    "userId": "64f7b1234567890abcdef123",
    "type": "CAPSTONE_REVIEW",
    "message": "Your capstone selection has been reviewed",
    "data": {
      "groupId": "64f7b1234567890abcdef999",
      "status": "Disetujui"
    },
    "isRead": false,
    "createdAt": "2024-09-24T12:00:00.000Z"
  },
  {
    "_id": "64f7b1234567890abcdef889",
    "userId": "64f7b1234567890abcdef123",
    "type": "GROUP_CREATED",
    "message": "You have been added to a new group",
    "data": {
      "groupId": "64f7b1234567890abcdef999",
      "groupName": "Kelompok Sistem Informasi A"
    },
    "isRead": true,
    "createdAt": "2024-09-24T10:30:00.000Z"
  }
]
```

**Business Rules:**
- Returns notifications for authenticated user only
- Ordered by creation date (newest first)
- Includes read/unread status

---

### 3. Mark Notification as Read

**Endpoint:** `PATCH /api/notifications/:id/read`

**Authentication:** Bearer Token

**Required Role:** Any authenticated user (notification owner only)

**Request Headers:**

```
Authorization: Bearer <access-token>
```

**Response (200 - Success):**

```json
{
  "_id": "64f7b1234567890abcdef888",
  "userId": "64f7b1234567890abcdef123",
  "type": "CAPSTONE_REVIEW",
  "message": "Your capstone selection has been reviewed",
  "data": {
    "groupId": "64f7b1234567890abcdef999",
    "status": "Disetujui"
  },
  "isRead": true,
  "createdAt": "2024-09-24T12:00:00.000Z",
  "updatedAt": "2024-09-24T12:30:00.000Z"
}
```

**Business Rules:**
- User can only mark their own notifications as read
- Updates isRead field from false to true
- Updates updatedAt timestamp

---

## 🔑 Authentication Guide

### Cookie-based Authentication (Recommended)

**How it works:**
- Tokens automatically sent as HttpOnly cookies
- No manual token management needed
- More secure against XSS attacks

**Implementation:**

```javascript
// No special headers needed, cookies handled automatically
fetch('/api/users', {
  method: 'GET',
  credentials: 'include' // Include cookies
});
```

### Header-based Authentication

**How it works:**
- Manual token management in Authorization header
- Token stored in localStorage/sessionStorage
- Requires Bearer prefix

**Implementation:**

```javascript
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
```

### Token Lifecycle

1. **Login/Register** → Receive access token (15 min) + refresh token (7 days)
2. **API Calls** → Use access token
3. **Token Expiry** → Use refresh token to get new access token
4. **Logout** → Clear both tokens

---

## ⚡ HTTP Status Codes & Error Handling

| Status | Scenario | Response Format |
|--------|----------|-----------------|
| `200` | Success | `{ data, message }` |
| `201` | Created | `{ createdResource, message }` |
| `400` | Bad Request | `{ message, code?, hint? }` |
| `401` | Unauthorized | `{ message: "Access token required", code: "NO_TOKEN" }` |
| `403` | Forbidden | `{ message: "Insufficient permissions", code: "INSUFFICIENT_ROLE" }` |
| `404` | Not Found | `{ message: "Resource not found" }` |
| `500` | Server Error | `{ message: "Internal server error" }` |

### Common Error Codes

- `NO_TOKEN` - Access token tidak disertakan
- `TOKEN_EXPIRED` - Access token sudah expired  
- `INVALID_TOKEN` - Access token tidak valid
- `INSUFFICIENT_ROLE` - Role tidak memiliki akses
- `NO_USER` - User tidak ditemukan
- `VALIDATION_ERROR` - Request body validation failed
- `DUPLICATE_EMAIL` - Email sudah terdaftar
- `FILE_TOO_LARGE` - File melebihi 10MB
- `INVALID_FILE_TYPE` - File type tidak didukung

---

## 📞 Support

Untuk pertanyaan dan bantuan API, silakan lihat dokumentasi utama atau hubungi tim pengembang.

## 🎯 System Overview

**BEPAW3** adalah sistem manajemen capstone project yang menyediakan **27 endpoints** tersebar di **6 modul utama**:

| **Module** | **Endpoints** | **Description** |
|------------|---------------|------------------|
| 🔐 **Auth** | 7 | Authentication & authorization system |
| 👤 **User** | 4 | User management for admin |
| 🎓 **Capstone** | 7 | Capstone project management |
| 👥 **Group** | 4 | Student group management |
| ⭐ **Review** | 2 | Alumni review system |
| 🔔 **Notification** | 3 | Real-time notification system |

**Total: 27 endpoints** dengan role-based access control dan Google Drive integration.

### ✨ **Key Features:**

- 🔐 **OTP-based Authentication** dengan Google OAuth support
- 📁 **Google Drive Integration** dengan Shared Drive compatibility
- 👥 **Group Management** dengan role-based access control
- ⭐ **Review System** dengan detail group information
- 🔔 **Real-time Notifications** untuk status updates
- 🔍 **Advanced Search** dan filtering capabilities
- 🚀 **Memory-based File Upload** untuk optimal performance

---

## 🔐 Authentication Endpoints

**Base URL:** `/api/auth`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/register` | Register user baru dengan OTP verification | ❌ | - |
| `POST` | `/verify-otp` | Verifikasi OTP setelah register (auto login) | ❌ | - |
| `POST` | `/login` | Login dengan email dan password | ❌ | - |
| `POST` | `/refresh` | Refresh access token menggunakan refresh token | ❌ | - |
| `POST` | `/logout` | Logout dan hapus refresh token | ✅ | Any role |
| `GET` | `/google` | Initiate Google OAuth login | ❌ | - |
| `GET` | `/google/callback` | Google OAuth callback endpoint | ❌ | - |

### 📝 **Authentication Usage Examples:**

#### 1. User Registration
```javascript
// Register new user
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@mail.ugm.ac.id',
    password: 'securePassword123'
  })
});
// Response: { message: 'Registrasi berhasil. Cek email untuk kode OTP', email: 'john@mail.ugm.ac.id' }
```

#### 2. OTP Verification & Auto Login
```javascript
// Verify OTP after registration
const verifyResponse = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@mail.ugm.ac.id',
    otp: '123456'
  })
});
// Response: Auto-login dengan cookies dan user data
```

#### 3. Standard Login
```javascript
// Login with email and password
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@mail.ugm.ac.id',
    password: 'securePassword123'
  })
});
// Response: User data dengan cookies untuk session
```

---

## 👤 User Management Endpoints

**Base URL:** `/api/users`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/` | Mendapatkan semua user | ✅ | `admin` |
| `GET` | `/:id` | Mendapatkan user berdasarkan ID | ✅ | `admin` |
| `PATCH` | `/:id/role` | Update role user | ✅ | `admin` |
| `DELETE` | `/:id` | Delete user | ✅ | `admin` |

### 📝 **User Management Usage Examples:**

#### 1. Get All Users (Admin Only)
```javascript
const users = await fetch('/api/users', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + adminToken }
});
// Response: Array of all users with roles and verification status
```

#### 2. Update User Role
```javascript
const updateRole = await fetch('/api/users/64f7b123.../role', {
  method: 'PATCH',
  headers: { 
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({ role: 'alumni' })
});
// Response: Updated user object with new role
```

---

## 🎓 Capstone Management Endpoints

**Base URL:** `/api/capstones`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/` | Upload capstone dengan proposal file | ✅ | `alumni`, `admin` |
| `GET` | `/search` | Search capstone berdasarkan judul dan kategori | ✅ | Any role |
| `GET` | `/` | Mendapatkan semua capstone | ✅ | Any role |
| `GET` | `/:id` | Mendapatkan detail capstone | ✅ | Any role |
| `PUT` | `/:id` | Update capstone dengan optional proposal file | ✅ | `alumni`, `admin` |
| `GET` | `/:id/proposal` | Mendapatkan link proposal (admin only) | ✅ | `admin` |
| `DELETE` | `/:id` | Delete capstone | ✅ | `alumni`, `admin` |

### 📝 **Capstone Management Usage Examples:**

#### 1. Create Capstone with File Upload
```javascript
const formData = new FormData();
formData.append('judul', 'Machine Learning untuk Prediksi Cuaca');
formData.append('kategori', 'AI');
formData.append('deskripsi', 'Sistem prediksi cuaca menggunakan neural network');
formData.append('proposal', proposalFile); // File object

const capstone = await fetch('/api/capstones', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + alumniToken },
  body: formData
});
// Response: Created capstone with Google Drive proposal link
```

#### 2. Search Capstones
```javascript
const searchResults = await fetch('/api/capstones/search?judul=AI&kategori=Machine Learning', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
});
// Response: Array of matching capstones
```

#### 3. Get All Available Capstones
```javascript
const allCapstones = await fetch('/api/capstones', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + token }
});
// Response: All capstones with status and alumni info
```

---

## 👥 Group Management Endpoints

**Base URL:** `/api/groups`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/` | Create group baru | ✅ | `admin` |
| `DELETE` | `/:id` | Delete group | ✅ | `admin` |
| `POST` | `/:id/pilih` | Pilih capstone untuk group | ✅ | `mahasiswa` (ketua) |
| `GET` | `/:id` | Get group detail | ✅ | Group members |

### 📝 **Group Management Usage Examples:**

#### 1. Create New Group (Admin Only)
```javascript
const newGroup = await fetch('/api/groups', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    namaKelompok: 'Kelompok Sistem Informasi A',
    ketua: 'ketuaUserId123',
    anggota: ['userId1', 'userId2', 'userId3']
  })
});
// Response: Created group with members and leader info
```

#### 2. Group Leader Chooses Capstone
```javascript
const chooseCapstone = await fetch('/api/groups/groupId123/pilih', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + ketuaToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    capstoneId: 'capstoneId456'
  })
});
// Response: Updated group with selected capstone, triggers notification to alumni
```

#### 3. Get Group Details (Members Only)
```javascript
const groupDetails = await fetch('/api/groups/groupId123', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + memberToken }
});
// Response: Complete group info with members, leader, and selected capstone
```

---

## ⭐ Review Management Endpoints

**Base URL:** `/api/reviews`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `GET` | `/pending` | Get pending group reviews for alumni's capstones | ✅ | `alumni` |
| `POST` | `/:id` | Review group capstone request | ✅ | `alumni` |

### 📝 **Review Management Usage Examples:**

#### 1. Get Pending Reviews (Alumni Only)
```javascript
const pendingReviews = await fetch('/api/reviews/pending', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + alumniToken }
});
// Response: { message: "Pending reviews", pendingGroups: [...], count: 3 }
```

#### 2. Review Group Selection
```javascript
const reviewResult = await fetch('/api/reviews/groupId123', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + alumniToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    status: 'Disetujui' // or 'Ditolak'
  })
});
// Response: Updated group with review status, auto-notification to group leader
```

---

## 🔔 Notification Management Endpoints

**Base URL:** `/api/notifications`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/` | Create new notification | ✅ | Any role |
| `GET` | `/` | Get user notifications | ✅ | Any role |
| `PATCH` | `/:id/read` | Mark notification as read | ✅ | Any role |

### 📝 **Notification Management Usage Examples:**

#### 1. Get User Notifications
```javascript
const notifications = await fetch('/api/notifications', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer ' + userToken }
});
// Response: Array of notifications ordered by newest first
/* Example response:
[
  {
    _id: "notifId123",
    type: "CAPSTONE_REVIEW",
    message: "Your capstone selection has been reviewed",
    isRead: false,
    createdAt: "2024-09-24T10:30:00.000Z"
  }
]
*/
```

#### 2. Mark Notification as Read
```javascript
const markRead = await fetch('/api/notifications/notifId123/read', {
  method: 'PATCH',
  headers: { 'Authorization': 'Bearer ' + userToken }
});
// Response: Updated notification with isRead: true
```

#### 3. Create System Notification
```javascript
const newNotification = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    userId: 'targetUserId',
    type: 'SYSTEM_ANNOUNCEMENT',
    message: 'New capstone project available for selection',
    data: {
      capstoneId: 'newCapstoneId'
    }
  })
});
// Response: Created notification object
```

**Notification Types:**
- `CAPSTONE_REVIEW` - Review hasil capstone selection
- `GROUP_CREATED` - Group baru dibuat  
- `SYSTEM_ANNOUNCEMENT` - Pengumuman sistem
- `STATUS_UPDATE` - Update status project

---

## 🚀 Complete Workflow Examples

### 🎓 Student Registration to Project Completion

```javascript
// 1. Student registers
const register = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Student Name',
    email: 'student@mail.ugm.ac.id',
    password: 'password123'
  })
});

// 2. Verify OTP from email
const verify = await fetch('/api/auth/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@mail.ugm.ac.id',
    otp: '123456'
  })
});

// 3. Check available capstones
const capstones = await fetch('/api/capstones', {
  headers: { 'Authorization': 'Bearer ' + studentToken }
});

// 4. Wait for admin to create group and assign as leader

// 5. Choose capstone as group leader
const chooseCapstone = await fetch('/api/groups/groupId/pilih', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + studentToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({ capstoneId: 'selectedCapstoneId' })
});

// 6. Check notifications for review updates
const notifications = await fetch('/api/notifications', {
  headers: { 'Authorization': 'Bearer ' + studentToken }
});
```

### 🎓 Alumni Project Management

```javascript
// 1. Alumni creates capstone project
const formData = new FormData();
formData.append('judul', 'AI-Powered Learning System');
formData.append('kategori', 'Education Technology');
formData.append('deskripsi', 'Intelligent tutoring system using machine learning');
formData.append('proposal', proposalFile);

const newCapstone = await fetch('/api/capstones', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + alumniToken },
  body: formData
});

// 2. Check for pending group reviews
const pendingReviews = await fetch('/api/reviews/pending', {
  headers: { 'Authorization': 'Bearer ' + alumniToken }
});

// 3. Review group selections
for (const group of pendingReviews.pendingGroups) {
  const review = await fetch(`/api/reviews/${group._id}`, {
    method: 'POST',
    headers: { 
      'Authorization': 'Bearer ' + alumniToken,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      status: 'Disetujui' // Review each group
    })
  });
}
```

### 👨‍💼 Admin System Management

```javascript
// 1. Get all users
const allUsers = await fetch('/api/users', {
  headers: { 'Authorization': 'Bearer ' + adminToken }
});

// 2. Create student groups
const newGroup = await fetch('/api/groups', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    namaKelompok: 'Team Alpha',
    ketua: 'studentId1',
    anggota: ['studentId1', 'studentId2', 'studentId3']
  })
});

// 3. Send system announcements
const announcement = await fetch('/api/notifications', {
  method: 'POST',
  headers: { 
    'Authorization': 'Bearer ' + adminToken,
    'Content-Type': 'application/json' 
  },
  body: JSON.stringify({
    userId: 'allStudents', // Or specific user ID
    type: 'SYSTEM_ANNOUNCEMENT',
    message: 'Deadline for capstone selection: October 15, 2024'
  })
});
```

---

## 🔑 Authentication Methods

### Cookie-based Authentication (Recommended)

```javascript
// Automatic cookie handling
fetch('/api/users', {
  method: 'GET',
  credentials: 'include' // Include cookies automatically
});
```

### Header-based Authentication

```javascript
// Manual token in headers
fetch('/api/users', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + accessToken
  }
});
```

---

## ⚡ HTTP Status Codes

| Status Code | Description | When It Occurs |
|-------------|-------------|----------------|
| `200` | Success | Request processed successfully |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Invalid data or missing fields |
| `401` | Unauthorized | Invalid/expired token or no token |
| `403` | Forbidden | Valid token but insufficient permissions |
| `404` | Not Found | Resource not found or user doesn't exist |
| `500` | Internal Server Error | Server-side error occurred |

---

## 🛡️ Error Handling Examples

```javascript
// Comprehensive error handling
async function makeAPICall(endpoint, options) {
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`Validation Error: ${error.message}`);
        case 401:
          throw new Error(`Authentication Error: ${error.message}`);
        case 403:
          throw new Error(`Permission Error: ${error.message}`);
        case 404:
          throw new Error(`Not Found: ${error.message}`);
        case 500:
          throw new Error(`Server Error: ${error.message}`);
        default:
          throw new Error(`API Error: ${error.message}`);
      }
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Call failed:', error);
    throw error;
  }
}

// Usage example
try {
  const capstones = await makeAPICall('/api/capstones', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ' + token }
  });
  
  console.log('Capstones loaded:', capstones);
} catch (error) {
  console.error('Failed to load capstones:', error.message);
}
```

---

## 📞 Support

Untuk pertanyaan dan bantuan API, silakan lihat dokumentasi utama atau hubungi tim pengembang.