# 📋 API Endpoints - BEPAW3 System

## 🔐 Authentication Endpoints
**Base URL:** `/api/auth`

| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| `POST` | `/register` | Register user baru dengan OTP verification | ❌ | - |
| `POST` | `/send-otp` | Request OTP untuk login (setelah password valid) | ❌ | - |
| `POST` | `/verify-otp` | Verifikasi OTP setelah register (auto login) | ❌ | - |
| `POST` | `/login` | Login dengan email dan OTP | ❌ | - |
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
| `GET` | `/:id/proposal` | Mendapatkan link proposal (admin only) | ✅ | `admin` |
| `GET` | `/search` | Search capstone berdasarkan judul dan kategori | ✅ | Any role |

---

### 🎓 Capstone Management Endpoints

#### 1. Create Capstone with Proposal Upload (Alumni Only)

```http
POST /api/capstones
```

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Form Data:**
```
judul: "Sistem Manajemen Perpustakaan Digital"
kategori: "Web Development"
deskripsi: "Aplikasi web untuk mengelola buku dan peminjaman perpustakaan dengan fitur digital lending"
proposal: [FILE] (PDF/DOC/DOCX)
```

**Response (201):**
```json
{
  "_id": "64f7b1234567890abcdef123",
  "judul": "Sistem Manajemen Perpustakaan Digital",
  "kategori": "Web Development",
  "deskripsi": "Aplikasi web untuk mengelola buku dan peminjaman perpustakaan dengan fitur digital lending",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "status": "Tersedia",
  "proposalFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

**Notes:**
- File proposal diupload ke Google Drive dalam folder khusus
- Hanya alumni yang sudah login yang bisa membuat capstone
- Setiap alumni hanya boleh memiliki 1 capstone
- File yang diizinkan: PDF, DOC, DOCX
- Proposal tidak dapat diakses oleh user biasa (hanya admin)

---

#### 2. Get All Capstones

```http
GET /api/capstones
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
    "judul": "Sistem Manajemen Perpustakaan Digital",
    "kategori": "Web Development",
    "deskripsi": "Aplikasi web untuk mengelola buku dan peminjaman perpustakaan",
    "alumni": {
      "_id": "64f7b1234567890abcdef456",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    },
    "status": "Tersedia",
    "createdAt": "2024-09-24T10:30:00.000Z",
    "updatedAt": "2024-09-24T10:30:00.000Z"
  }
]
```

**Notes:**
- Data proposal (proposalUrl, proposalFileId) tidak dikembalikan untuk non-admin
- Semua user yang login bisa mengakses daftar capstone

---

#### 3. Get Capstone Detail

```http
GET /api/capstones/:id
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200) - Non-Admin:**
```json
{
  "_id": "64f7b1234567890abcdef123",
  "judul": "Sistem Manajemen Perpustakaan Digital",
  "kategori": "Web Development", 
  "deskripsi": "Aplikasi web untuk mengelola buku dan peminjaman perpustakaan dengan fitur digital lending",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "status": "Tersedia",
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

**Response (200) - Admin:**
```json
{
  "_id": "64f7b1234567890abcdef123",
  "judul": "Sistem Manajemen Perpustakaan Digital",
  "kategori": "Web Development",
  "deskripsi": "Aplikasi web untuk mengelola buku dan peminjaman perpustakaan dengan fitur digital lending", 
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "status": "Tersedia",
  "proposalUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view",
  "proposalFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "createdAt": "2024-09-24T10:30:00.000Z", 
  "updatedAt": "2024-09-24T10:30:00.000Z"
}
```

**Notes:**
- Admin mendapat akses ke informasi proposal (proposalUrl, proposalFileId)
- Non-admin tidak dapat melihat informasi proposal untuk keamanan

---

#### 4. Get Proposal Link (Admin Only)

```http
GET /api/capstones/:id/proposal
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "proposalUrl": "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view"
}
```

**Notes:**
- Hanya admin yang bisa mengakses link proposal
- Link dibuat secara otomatis dengan permission "anyone with link can view"
- Link disimpan dalam database setelah dibuat pertama kali
- File tersimpan di Google Drive dengan akses terbatas

---

#### 5. Update Capstone (Alumni/Admin Only)

```http
PUT /api/capstones/:id
```

**Content-Type:** `multipart/form-data`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Form Data (All optional):**
```
judul: "Sistem Manajemen Perpustakaan Digital - Updated"
kategori: "Mobile Development"
deskripsi: "Updated description"
status: "Diambil"
proposal: [FILE] (PDF/DOC/DOCX) - Optional new file
```

**Response (200):**
```json
{
  "_id": "64f7b1234567890abcdef123",
  "judul": "Sistem Manajemen Perpustakaan Digital - Updated",
  "kategori": "Mobile Development",
  "deskripsi": "Updated description",
  "status": "Diambil",
  "alumni": {
    "_id": "64f7b1234567890abcdef456",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id"
  },
  "proposalFileId": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "createdAt": "2024-09-24T10:30:00.000Z",
  "updatedAt": "2024-09-24T11:30:00.000Z"
}
```

**Notes:**
- Alumni can only update their own capstone
- Admin can update any capstone
- If new proposal file uploaded, old file is deleted from Google Drive
- All fields are optional - only provided fields will be updated

---

#### 6. Search Capstones

```http
GET /api/capstones/search?judul=machine&kategori=AI
```

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `judul` (optional): Search by title (case-insensitive partial match)
- `kategori` (optional): Search by category (exact match)

**Response (200):**
```json
[
  {
    "_id": "64f7b1234567890abcdef123",
    "judul": "Machine Learning untuk Prediksi Cuaca",
    "kategori": "AI",
    "deskripsi": "Sistem prediksi cuaca menggunakan neural network",
    "alumni": {
      "_id": "64f7b1234567890abcdef456",
      "name": "John Doe",
      "email": "john@mail.ugm.ac.id"
    },
    "status": "Tersedia",
    "createdAt": "2024-09-24T10:30:00.000Z",
    "updatedAt": "2024-09-24T10:30:00.000Z"
  }
]
```

**Notes:**
- Title search uses regex for partial, case-insensitive matching
- Category search is exact match
- Both parameters can be combined for refined search
- Returns array of matching capstones with alumni details

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

#### 4. Login with OTP
```
POST /api/auth/login
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
// Frontend setup
fetch('/api/users', {
  method: 'GET',
  credentials: 'include' // Penting untuk cookie support
});
```

### Header-based Authentication
```javascript
// Frontend setup
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
| `admin` | Full access to all endpoints, can view proposal files, manage users |
| `alumni` | Can create capstone projects with proposal uploads, view all capstones |
| `mahasiswa` | Can view capstone projects (student access) |
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

### Capstone Access Permissions
- **Alumni**: Can upload new capstone proposals (limit: 1 per alumni)
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
  1. File uploaded via multipart/form-data to memory buffer
  2. Direct stream from memory buffer to Google Drive
  3. Google Drive file ID saved to database
  4. No temporary files created on server disk
- **Access Control**: Only admin can generate shareable links
- **Folder**: Files stored in designated Google Drive Shared Drive folder
- **Service Account**: Uses environment variable `GOOGLE_DRIVE_FOLDER_ID`
- **Shared Drive Support**: Full compatibility with Google Shared Drives

### File Upload Security & Performance
- **Memory Storage**: Files processed in memory for better performance
- **File Size Limit**: 10MB enforced by multer configuration
- **MIME Type Validation**: Server-side validation
- **Access Restrictions**: Proposals only accessible by admin
- **Link Generation**: Automatic shareable link creation for admin access
- **No Disk I/O**: Eliminates temporary file creation and cleanup
- **Container Ready**: Works perfectly in Docker/Kubernetes environments
- **Scalable**: No shared disk storage dependencies

---

## 🔄 Token Management

### Access Token
- **Duration**: 15 minutes
- **Usage**: For all API calls
- **Auto-refresh**: When approaching expiry

### Refresh Token  
- **Duration**: 7 days
- **Usage**: To refresh access token
- **Storage**: Secure client-side storage

### Auto-Refresh Flow
1. Client detects access token expiring soon
2. Auto call `POST /api/auth/refresh`
3. Get new access token
4. Retry original API call

---

## 🚀 Getting Started

1. **Start Server**: `npm start`
2. **Base URL**: `http://localhost:3000`
3. **Register User**: `POST /api/auth/register`
4. **Verify OTP**: `POST /api/auth/verify-otp`
5. **Access Protected Routes**: Include Authorization header or enable cookies

### Frontend Examples

#### Upload Capstone with File (JavaScript)
```javascript
// Create FormData for file upload
const formData = new FormData();
formData.append('judul', 'Sistem Manajemen Perpustakaan Digital');
formData.append('kategori', 'Web Development');
formData.append('deskripsi', 'Aplikasi web untuk mengelola buku dan peminjaman perpustakaan');
formData.append('proposal', fileInput.files[0]); // File from input element

// Upload capstone
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
  credentials: 'include' // For cookie-based auth
})
.then(response => response.json())
.then(capstones => {
  console.log('All capstones:', capstones);
  // Display capstones in UI
})
.catch(error => console.error('Error:', error));
```

#### Admin Get Proposal Link (JavaScript)
```javascript
// Only admin can access this
fetch(`/api/capstones/${capstoneId}/proposal`, {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer ' + adminAccessToken
  }
})
.then(response => response.json())
.then(data => {
  console.log('Proposal URL:', data.proposalUrl);
  // Open proposal in new tab
  window.open(data.proposalUrl, '_blank');
})
.catch(error => console.error('Error:', error));
```

#### Update Capstone with Optional File (JavaScript)
```javascript
// Update capstone data with optional new proposal file
const formData = new FormData();
formData.append('judul', 'Updated Capstone Title');
formData.append('status', 'Diambil');

// Optional: Add new proposal file
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
  // Update UI with new data
})
.catch(error => console.error('Error:', error));
```

#### Search Capstones (JavaScript)
```javascript
// Search capstones by title and/or category
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
  // Display filtered capstones
  results.forEach(capstone => {
    console.log(`Found: ${capstone.judul} - ${capstone.kategori}`);
  });
})
.catch(error => console.error('Error:', error));
```

---

## 📞 Support

For API support and questions, please refer to the main documentation or contact the development team.