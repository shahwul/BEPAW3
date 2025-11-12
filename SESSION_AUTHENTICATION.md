# 🔐 Sistem Session & Authentication BEPAW3

## 📋 Overview

BEPAW3 menggunakan **JWT (JSON Web Token)** based authentication dengan **single-token system** untuk kesederhanaan dan keamanan.

### 🎯 **Token Strategy:**

| Token Type | Duration | Storage | Purpose |
|------------|----------|---------|---------|
| **JWT Token** | 1 hari | Cookie (httpOnly: true) + Header | Authentication & API requests |

### 🔐 **Authentication Methods:**

1. **OTP Email Verification** - Untuk registrasi user baru
2. **Password Login** - Untuk user yang sudah verified
3. **Pre-populated Users** - Admin dapat membuat user sebelumnya (unclaimed)

---

## 🏗️ Architecture

### 1. **Single-Token System**

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
├─────────────────────────────────────────────────────────┤
│  JWT Token                                              │
│  - 1 day (24 hours)                                     │
│  - httpOnly: true (secure)                              │
│  - For authentication & API calls                       │
└──────────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│                    SERVER                                │
│  ┌────────────────────────────────────────────────────┐ │
│  │  JWT Verification                                  │ │
│  │  - verifyToken()                                   │ │
│  │  - Extract from cookie or Authorization header    │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  OTP System (Registration)                         │ │
│  │  - In-memory OTP storage                           │ │
│  │  - 10 minutes expiry                               │ │
│  │  - Email delivery via nodemailer                   │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Database                                          │ │
│  │  - User.isVerified (OTP verified)                  │ │
│  │  - User.isClaimed (pre-populated user claimed)     │ │
│  └────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## 🔑 Token Details

### **JWT Token**

**Purpose:** Autentikasi untuk setiap API request & session management

**Payload:**
```javascript
{
  id: "user_id",
  role: "mahasiswa", // admin, dosen, alumni, mahasiswa, guest
  email: "user@mail.ugm.ac.id",
  iat: 1699876543,  // Issued at
  exp: 1699962943   // Expires at (24 hours later)
}
```

**Configuration:**
```javascript
{
  secret: process.env.JWT_SECRET,
  expiresIn: "1d", // 1 day
  algorithm: "HS256"
}
```

**Cookie Options:**
```javascript
{
  httpOnly: true,     // JavaScript cannot access (XSS protection)
  secure: true,       // HTTPS only (production)
  sameSite: 'lax',    // CSRF protection
  maxAge: 86400000,   // 24 hours (1 day)
  path: '/'           // Available for all routes
}
```

### **Storage Strategy:**

- **Cookie (Primary):** httpOnly cookie untuk auto-send dengan setiap request
- **Authorization Header (Alternative):** Manual `Bearer {token}` untuk API clients

**Middleware Priority:**
1. Check `Authorization: Bearer {token}` header
2. Fallback to `req.cookies.token`

---

## 👥 User Roles & Email Domains

BEPAW3 menggunakan email domain untuk auto-assign role:

| Email Domain | Role | Notes |
|--------------|------|-------|
| `@mail.ugm.ac.id` | `mahasiswa` atau `alumni` | Mahasiswa aktif atau alumni |
| `@ugm.ac.id` | `dosen` atau `admin` | Dosen atau admin sistem |
| Other | `guest` | Role default untuk email luar UGM |

### **Role Permissions:**

- **admin**: Full access, manage all resources
- **dosen**: Review capstones, manage groups
- **alumni**: Review capstones yang di-assign
- **mahasiswa**: Create groups, submit capstones
- **guest**: Read-only access (limited)

### **User Fields:**

```javascript
{
  email: String,           // Required, unique
  password: String,        // Required, bcrypt hashed
  name: String,            // Optional saat register
  role: String,            // Auto-assigned from email domain
  nim: String,             // Sparse unique, untuk mahasiswa/alumni
  prodi: String,           // Program studi, untuk mahasiswa/alumni
  isVerified: Boolean,     // true setelah verify OTP
  isClaimed: Boolean,      // true untuk self-registered atau claimed pre-populated user
  createdAt: Date,
  updatedAt: Date
}

---

## 🔄 Authentication Flow

### **1. New User Registration (Email + OTP)**

```
┌─────────┐
│ CLIENT  │
└────┬────┘
     │
     │ 1. POST /api/auth/register
     │    { email, password }
     │    { name, nim, prodi } ← optional
     ▼
┌─────────────────┐
│ SERVER          │
│ - Check exist   │
│ - Validate UGM  │
│ - Generate OTP  │
│ - Send Email    │
│ - Hash password │
│ - Save user     │
│   (unverified)  │
└────┬────────────┘
     │
     │ 2. Email with 6-digit OTP (10 min expiry)
     ▼
┌─────────┐
│ CLIENT  │ Enter OTP
└────┬────┘
     │
     │ 3. POST /api/auth/verify-otp
     │    { email, otp }
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Verify OTP         │
│ - Set isVerified=true│
│ - Generate JWT Token │
│ - Set Cookie         │
└────┬─────────────────┘
     │
     │ 4. Set-Cookie: token=...
     ▼
┌─────────┐
│ CLIENT  │ Logged In ✅
└─────────┘
```

**Key Points:**
- ✅ Email dan password **required**
- ✅ Name, NIM, Prodi **optional** saat register
- ✅ OTP expires dalam 10 menit
- ✅ User otomatis login setelah verify OTP
- ✅ Role auto-assigned dari email domain

---

### **2. Login Flow (Existing User)**

```
┌─────────┐
│ CLIENT  │
└────┬────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Find user          │
│ - Check isVerified   │
│ - Verify password    │
│ - Generate JWT Token │
│ - Set Cookie         │
└────┬─────────────────┘
     │
     │ 2. Set-Cookie: token=...
     ▼
┌─────────┐
│ CLIENT  │ Logged In ✅
└─────────┘
```

**Validations:**
- ✅ Email must exist
- ✅ User must be verified (`isVerified: true`)
- ✅ Password must match (bcrypt compare)

---

### **3. Pre-populated User Claim Flow**

Admin dapat membuat user sebelumnya (unclaimed):

```
┌─────────┐
│ ADMIN   │
└────┬────┘
     │
     │ 1. POST /api/users (admin only)
     │    { email, name, role, nim, prodi }
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Create user        │
│ - isVerified: false  │
│ - isClaimed: false   │
│ - No password yet    │
└────┬─────────────────┘
     │
     │ User created ✅
     ▼
┌─────────┐
│ USER    │ Receive notification
└────┬────┘
     │
     │ 2. POST /api/auth/register
     │    { email, password }
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Find existing user │
│ - Check isClaimed    │
│ - Generate OTP       │
│ - Send email         │
│ - Hash password      │
│ - Update user        │
└────┬─────────────────┘
     │
     │ 3. OTP email sent
     ▼
┌─────────┐
│ USER    │ Verify OTP
└────┬────┘
     │
     │ 4. POST /api/auth/verify-otp
     │    { email, otp }
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Verify OTP         │
│ - Set isVerified=true│
│ - Set isClaimed=true │
│ - Generate JWT       │
└────┬─────────────────┘
     │
     │ 5. User claimed & logged in ✅
     ▼
```

**Benefits:**
- ✅ Admin dapat pre-populate data (nama, nim, prodi, dll)
- ✅ User hanya perlu set password dan verify
- ✅ Data integrity terjaga

---

### **4. API Request with Authentication**

```
┌─────────┐
│ CLIENT  │
└────┬────┘
     │
     │ 1. GET /api/capstones
     │    Cookie: token=xxx (auto-sent)
     │    OR
     │    Authorization: Bearer xxx
     ▼
┌──────────────────────┐
│ AUTH MIDDLEWARE      │
│ - Extract Token      │
│   1. Check header    │
│   2. Check cookie    │
│ - Verify JWT         │
│ - Check Expiry       │
│ - Attach req.user    │
└────┬─────────────────┘
     │
     ├─ Valid ✅
     │  ▼
     │  Continue to Route
     │
     └─ Invalid/Expired ❌
        ▼
        401 { message: "Unauthorized" }
```

---

### **5. Logout Flow**

```
┌─────────┐
│ CLIENT  │
└────┬────┘
     │
     │ 1. POST /api/auth/logout
     │    Cookie: token=xxx
     ▼
┌──────────────────────┐
│ SERVER               │
│ - Clear Cookie       │
└────┬─────────────────┘
     │
     │ 2. Clear-Cookie: token
     ▼
┌─────────┐
│ CLIENT  │ Logged Out ✅
└─────────┘
```

**Simple & Clean:**
- ✅ No database operation needed
- ✅ Just clear cookie
- ✅ JWT naturally expires after 24 hours

---

## 🛡️ Security Features

### **1. OTP Email Verification**

```javascript
// OTP Generation & Storage
const otp = crypto.randomInt(100000, 999999).toString(); // 6 digits
const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

// In-memory storage (production: use Redis)
otpStore.set(email, { otp, expiresAt });

// Email delivery
await transporter.sendMail({
  to: email,
  subject: 'Verify Your Email - BEPAW3',
  html: `Your OTP: <strong>${otp}</strong>`
});
```

**Security Benefits:**
- ✅ Prevents bot registrations
- ✅ Validates email ownership
- ✅ 10 minute expiry prevents replay attacks
- ✅ OTP auto-deleted after verification

---

### **2. Cookie Security**

| Feature | Value | Benefit |
|---------|-------|---------|
| **httpOnly** | ✅ true | Prevents XSS attacks (JavaScript cannot read) |
| **secure** | ✅ (prod) | HTTPS only in production |
| **sameSite** | lax | CSRF protection |
| **maxAge** | 86400000 | 24 hours auto-expiry |
| **path** | / | Available for all routes |

**Cookie Options (Production):**
```javascript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000,
  path: '/'
}
```

---

### **3. Password Security**

```javascript
// Hashing with bcrypt (salt rounds: 10)
const hashedPassword = await bcrypt.hash(password, 10);

// Verification
const isValid = await bcrypt.compare(password, user.password);
```

**Benefits:**
- ✅ One-way encryption (cannot decrypt)
- ✅ Salt prevents rainbow table attacks
- ✅ Computationally expensive (brute-force resistant)

---

### **4. JWT Token Verification**

```javascript
// Token verification in middleware
try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // { id, email, role }
  next();
} catch (err) {
  return res.status(401).json({ message: "Unauthorized" });
}
```

**Security Checks:**
1. ✅ Signature verification (tamper-proof)
2. ✅ Expiry check (auto-handled by jwt.verify)
3. ✅ Payload integrity

---

### **5. Email Domain Validation**

```javascript
// Auto-assign role based on email domain
const determineRole = (email) => {
  if (email.endsWith('@mail.ugm.ac.id')) {
    return 'mahasiswa'; // or 'alumni'
  }
  if (email.endsWith('@ugm.ac.id')) {
    return 'dosen'; // or 'admin'
  }
  return 'guest';
};
```

**Benefits:**
- ✅ Auto role assignment
- ✅ UGM email validation
- ✅ Prevents unauthorized role claims

---

### **6. Pre-populated User Security**

**Flow:**
1. Admin creates user (unclaimed, unverified)
2. User registers with same email
3. System detects existing user
4. Sends OTP to verify ownership
5. User sets password & verifies
6. Account becomes claimed & verified

**Security:**
- ✅ Email verification required (OTP)
- ✅ Password control stays with user
- ✅ Prevents account hijacking
- ✅ Admin cannot access user account

---

### **7. NIM Uniqueness**

```javascript
// Sparse unique index on nim field
{
  nim: {
    type: String,
    sparse: true,  // Only enforce unique if value exists
    unique: true
  }
}
```

**Benefits:**
- ✅ Prevents duplicate NIM
- ✅ Allows users without NIM (optional field)
- ✅ Data integrity for mahasiswa/alumni

---

## 📡 API Usage Examples

### **1. Register New User**

**Request:**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "mahasiswa@mail.ugm.ac.id",
  "password": "password123"
}

# Optional fields:
{
  "email": "mahasiswa@mail.ugm.ac.id",
  "password": "password123",
  "name": "John Doe",
  "nim": "22/123456/TK/12345",
  "prodi": "Teknik Komputer"
}
```

**Response:**
```json
{
  "message": "Registrasi berhasil. OTP telah dikirim ke email Anda.",
  "email": "mahasiswa@mail.ugm.ac.id"
}
```

**What Happens:**
1. ✅ User created in database (unverified)
2. ✅ Password hashed with bcrypt
3. ✅ OTP generated (6 digits)
4. ✅ Email sent with OTP
5. ✅ OTP expires in 10 minutes

---

### **2. Verify OTP**

**Request:**
```bash
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "mahasiswa@mail.ugm.ac.id",
  "otp": "123456"
}
```

**Response:**
```json
{
  "message": "Email berhasil diverifikasi",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "mahasiswa@mail.ugm.ac.id",
    "role": "mahasiswa",
    "nim": "22/123456/TK/12345",
    "prodi": "Teknik Komputer",
    "isVerified": true,
    "isClaimed": true
  }
}
```

**Cookies Set:**
```
Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

**User is now logged in!** ✅

---

### **3. Login (Existing User)**

**Request:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "mahasiswa@mail.ugm.ac.id",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "mahasiswa@mail.ugm.ac.id",
    "role": "mahasiswa",
    "nim": "22/123456/TK/12345",
    "prodi": "Teknik Komputer",
    "isVerified": true
  }
}
```

**Cookies Set:**
```
Set-Cookie: token=eyJhbGc...; HttpOnly; Secure; SameSite=Lax; Max-Age=86400
```

---

### **4. API Request with Cookie (Automatic)**

**Request:**
```bash
GET /api/capstones
Cookie: token=eyJhbGc...  # Auto-sent by browser
```

**Frontend Code:**
```javascript
// Fetch API
fetch('/api/capstones', {
  credentials: 'include'  // Important! Auto-send cookies
})
.then(res => res.json())
.then(data => console.log(data));

// Axios
axios.get('/api/capstones', {
  withCredentials: true  // Auto-send cookies
});
```

---

### **5. API Request with Authorization Header (Manual)**

**Request:**
```bash
GET /api/capstones
Authorization: Bearer eyJhbGc...
```

**Frontend Code:**
```javascript
const token = localStorage.getItem('token');

// Fetch API
fetch('/api/capstones', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Axios
axios.get('/api/capstones', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

### **6. Create Pre-populated User (Admin Only)**

**Request:**
```bash
POST /api/users
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "email": "new.student@mail.ugm.ac.id",
  "name": "Jane Doe",
  "role": "mahasiswa",
  "nim": "22/654321/TK/54321",
  "prodi": "Teknik Elektro"
}
```

**Response:**
```json
{
  "message": "User berhasil dibuat",
  "user": {
    "id": "user_id",
    "email": "new.student@mail.ugm.ac.id",
    "name": "Jane Doe",
    "role": "mahasiswa",
    "nim": "22/654321/TK/54321",
    "prodi": "Teknik Elektro",
    "isVerified": false,
    "isClaimed": false
  }
}
```

**User can now claim this account via register!**

---

### **7. Logout**

**Request:**
```bash
POST /api/auth/logout
Cookie: token=eyJhbGc...
```

**Response:**
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

## 🔧 Middleware Usage

### **1. Basic Authentication**

```javascript
const auth = require('./middlewares/auth');

// Protect route - require login
router.get('/capstones', auth, capstoneController.getAllCapstones);
```

**What it does:**
1. ✅ Extract token from `Authorization: Bearer {token}` OR `req.cookies.token`
2. ✅ Verify JWT signature and expiry
3. ✅ Attach `req.user` with decoded payload `{ id, email, role }`
4. ✅ Return 401 if invalid/missing

---

### **2. Role-Based Access Control**

```javascript
const auth = require('./middlewares/auth');
const role = require('./middlewares/role');

// Admin only
router.post('/users', auth, role(['admin']), userController.createUser);

// Alumni only
router.get('/reviews/pending', auth, role(['alumni']), reviewController.getPendingReviews);

// Multiple roles allowed
router.get('/groups/:id', auth, role(['admin', 'mahasiswa']), groupController.getGroupDetail);

// Dosen or admin
router.patch('/reviews/:id/approve', auth, role(['admin', 'dosen']), reviewController.approveReview);
```

**Role Middleware Logic:**
```javascript
// middlewares/role.js
module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Akses ditolak. Role tidak memiliki izin.' 
      });
    }
    next();
  };
};
```

---

### **3. Group Access Control**

```javascript
const auth = require('./middlewares/auth');
const groupAccess = require('./middlewares/groupAccess');

// Only group ketua or anggota can access
router.patch('/groups/:id', auth, groupAccess, groupController.updateGroup);
```

**Group Access Logic:**
```javascript
// middlewares/groupAccess.js
const Group = require('../models/group');

module.exports = async (req, res, next) => {
  const groupId = req.params.id;
  const userId = req.user.id;

  const group = await Group.findById(groupId);
  
  // Check if user is ketua or in anggota array
  const isKetua = group.ketua.toString() === userId;
  const isAnggota = group.anggota.some(id => id.toString() === userId);
  
  if (!isKetua && !isAnggota) {
    return res.status(403).json({ 
      message: 'Anda bukan anggota group ini' 
    });
  }
  
  next();
};
```

---

### **4. Middleware Chaining Example**

```javascript
// Complex access control
router.delete('/capstones/:id', 
  auth,                           // 1. Must be logged in
  role(['admin', 'mahasiswa']),   // 2. Must be admin or mahasiswa
  checkCapstoneOwnership,         // 3. Must own the capstone (custom)
  capstoneController.deleteCapstone
);
```

---

## 🎨 Frontend Integration

### **1. Registration Flow (React/Vue)**

```javascript
// Step 1: Register
const register = async (email, password, optionalData = {}) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ 
      email, 
      password,
      ...optionalData  // name, nim, prodi (optional)
    })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Show OTP input form
    return { success: true, email: data.email };
  } else {
    throw new Error(data.message);
  }
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Important! Receive cookies
    body: JSON.stringify({ email, otp })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Cookie automatically set by browser
    localStorage.setItem('user', JSON.stringify(data.user));
    // Redirect to dashboard
    return data.user;
  } else {
    throw new Error(data.message);
  }
};
```

---

### **2. Login Flow (React/Vue)**

```javascript
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Important! Receive cookies
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (response.ok) {
    // Cookie automatically set by browser
    localStorage.setItem('user', JSON.stringify(data.user));
    return data.user;
  } else {
    throw new Error(data.message);
  }
};
```

---

### **3. API Calls with Auto-Cookie**

```javascript
// Simple fetch (cookies auto-sent)
const fetchCapstones = async () => {
  const response = await fetch('/api/capstones', {
    credentials: 'include'  // Send cookies automatically
  });
  
  if (response.ok) {
    return await response.json();
  } else if (response.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login';
  }
};

// Axios setup (global config)
import axios from 'axios';

axios.defaults.withCredentials = true;  // Always send cookies

// Now all axios calls auto-send cookies
const capstones = await axios.get('/api/capstones');
```

---

### **4. Logout Flow**

```javascript
const logout = async () => {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include'  // Send cookie to clear
  });
  
  // Clear local storage
  localStorage.removeItem('user');
  
  // Redirect to login
  window.location.href = '/login';
};
```

---

### **5. Axios Interceptor (Advanced)**

```javascript
import axios from 'axios';

// Setup axios defaults
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:5000';

// Response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Now use axios normally
export default axios;
```

---

### **6. React Context Example**

```javascript
import { createContext, useState, useContext, useEffect } from 'react';
import axios from './axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (email, password) => {
    const { data } = await axios.post('/api/auth/login', { email, password });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const register = async (email, password, optionalData) => {
    await axios.post('/api/auth/register', { email, password, ...optionalData });
    return email;
  };

  const verifyOTP = async (email, otp) => {
    const { data } = await axios.post('/api/auth/verify-otp', { email, otp });
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = async () => {
    await axios.post('/api/auth/logout');
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, verifyOTP, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

**Usage:**
```javascript
function LoginPage() {
  const { login } = useAuth();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };
  
  // ... rest of component
}
```

---

## ⚙️ Environment Variables

```env
# JWT Secret (use strong random string)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# Node Environment
NODE_ENV=production  # or 'development'

# Email Configuration (nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/bepaw3

# Server Port
PORT=5000

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

**Security Notes:**
- ✅ Use `.env` file for local development
- ✅ Never commit `.env` to version control
- ✅ Use environment variables in production (Heroku, Vercel, etc.)
- ✅ JWT_SECRET should be at least 32 characters
- ✅ Use app-specific password for Gmail (2FA required)

---

## 📊 Token Lifecycle

```
Register/Login
     │
     ▼
┌─────────────────────────────────────┐
│ Generate JWT Token                  │
│ - Payload: { id, email, role }      │
│ - Expires in: 1 day                 │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ Store in Cookie                     │
│ - httpOnly: true                    │
│ - secure: true (production)         │
│ - sameSite: lax                     │
│ - maxAge: 86400000 (24 hours)      │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│ User Makes API Requests             │
│ - Cookie auto-sent with each req    │
│ - Middleware verifies token         │
│ - Attaches req.user                 │
└──────────┬──────────────────────────┘
           │
           ▼
    ┌──────┴──────┐
    │             │
    ▼             ▼
Valid Token   After 24h
Continue      │
Using         ▼
          ┌──────────────┐
          │ Token Expired│
          │ Login Again  │
          └──────────────┘
```

**Benefits of 24-hour token:**
- ✅ Balance antara security dan UX
- ✅ User tidak perlu login terlalu sering
- ✅ Reasonable expiry untuk mencegah token hijacking
- ✅ Simple (no refresh token complexity)

---

## 🚨 Error Handling

### **Error Response Format**

All authentication errors return JSON with consistent format:

```json
{
  "message": "Human-readable error message"
}
```

### **Common Error Scenarios**

| Endpoint | Status | Error | Cause | Solution |
|----------|--------|-------|-------|----------|
| `/auth/register` | 400 | Email sudah terdaftar | Duplicate email | Use login instead |
| `/auth/register` | 400 | Email harus menggunakan domain UGM | Invalid domain | Use @ugm.ac.id or @mail.ugm.ac.id |
| `/auth/verify-otp` | 400 | OTP tidak valid atau sudah expired | Wrong/expired OTP | Request new OTP |
| `/auth/login` | 400 | Email tidak terdaftar | Email not found | Register first |
| `/auth/login` | 400 | Email belum diverifikasi | OTP not verified | Check email for OTP |
| `/auth/login` | 401 | Password salah | Wrong password | Check password |
| Any protected route | 401 | Token tidak ditemukan | No cookie/header | Login required |
| Any protected route | 401 | Token tidak valid | Invalid JWT | Login again |
| Any protected route | 401 | Token expired | JWT expired (>24h) | Login again |
| Role-protected route | 403 | Akses ditolak | Insufficient role | Need different role |
| `/users` POST | 403 | Only admin allowed | Non-admin user | Admin access required |
| `/users/:id` PATCH | 400 | NIM sudah digunakan | Duplicate NIM | Use different NIM |

### **Frontend Error Handling Example**

```javascript
const handleAPICall = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include'
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      switch (response.status) {
        case 401:
          // Unauthorized - redirect to login
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
          
        case 403:
          // Forbidden - show access denied message
          throw new Error(data.message || 'Akses ditolak');
          
        case 400:
          // Bad request - show validation error
          throw new Error(data.message || 'Request tidak valid');
          
        default:
          throw new Error(data.message || 'Terjadi kesalahan');
      }
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
```

---

## 🔍 Debugging

### **1. Check Token in Browser**

```javascript
// In browser console
document.cookie
// Should show: token=eyJhbGc...

// Decode token (client-side)
function parseJWT(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64).split('').map(c => 
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')
  );
  return JSON.parse(jsonPayload);
}

// Get token from cookie
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('token='))
  ?.split('=')[1];

console.log(parseJWT(token));
// Output: { id: "...", email: "...", role: "...", iat: ..., exp: ... }
```

### **2. Test Authentication**

```javascript
// Check if logged in
fetch('/api/capstones', { credentials: 'include' })
  .then(r => {
    if (r.ok) {
      console.log('✅ Logged in');
    } else if (r.status === 401) {
      console.log('❌ Not logged in or token expired');
    }
  });
```

### **3. Test OTP System**

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@mail.ugm.ac.id","password":"test123"}'

# 2. Check email for OTP (or check server console in development)

# 3. Verify OTP
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"test@mail.ugm.ac.id","otp":"123456"}'

# 4. Use token
curl -X GET http://localhost:5000/api/capstones \
  -b cookies.txt
```

### **4. Server-Side Debugging**

Add logging to middleware:

```javascript
// middlewares/auth.js
module.exports = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
  
  console.log('🔍 Auth Debug:');
  console.log('  Token from header:', req.headers.authorization);
  console.log('  Token from cookie:', req.cookies.token);
  console.log('  Final token:', token);
  
  if (!token) {
    console.log('  ❌ No token found');
    return res.status(401).json({ message: 'Token tidak ditemukan' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('  ✅ Token valid:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('  ❌ Token invalid:', err.message);
    return res.status(401).json({ message: 'Token tidak valid' });
  }
};
```

## ✅ Best Practices

### **1. Frontend Best Practices**

**DO:**
- ✅ Always use `credentials: 'include'` for fetch/axios
- ✅ Store user info in `localStorage`, NOT tokens (tokens in httpOnly cookies)
- ✅ Clear `localStorage` on logout
- ✅ Handle 401 errors by redirecting to login
- ✅ Show user-friendly error messages
- ✅ Validate inputs before sending to API
- ✅ Use HTTPS in production

**DON'T:**
- ❌ Store JWT tokens in `localStorage` (XSS vulnerability)
- ❌ Store JWT tokens in regular cookies (use httpOnly)
- ❌ Send password in plain text (always HTTPS)
- ❌ Hard-code sensitive data
- ❌ Ignore error responses

---

### **2. Backend Best Practices**

**DO:**
- ✅ Use httpOnly cookies for JWT tokens
- ✅ Hash passwords with bcrypt (salt rounds >= 10)
- ✅ Validate email domains (@ugm.ac.id, @mail.ugm.ac.id)
- ✅ Use environment variables for secrets
- ✅ Implement rate limiting (prevent brute force)
- ✅ Log authentication attempts
- ✅ Use HTTPS in production (secure cookies)
- ✅ Set appropriate CORS headers
- ✅ Validate all inputs
- ✅ Return generic error messages (don't leak info)

**DON'T:**
- ❌ Store passwords in plain text
- ❌ Use weak JWT secrets
- ❌ Expose sensitive user data in responses
- ❌ Allow unlimited OTP attempts
- ❌ Keep OTPs forever (use expiry)
- ❌ Trust client-provided role/permissions

---

### **3. Security Best Practices**

**Token Security:**
- ✅ JWT secret minimum 32 characters
- ✅ httpOnly cookies prevent XSS
- ✅ sameSite cookies prevent CSRF
- ✅ HTTPS prevents man-in-the-middle attacks
- ✅ Token expiry (24 hours) limits exposure

**Password Security:**
- ✅ Minimum password length enforcement
- ✅ bcrypt with salt (computationally expensive)
- ✅ No password in logs/responses
- ✅ Password change requires old password

**Email/OTP Security:**
- ✅ OTP expires in 10 minutes
- ✅ OTP rate limiting
- ✅ Email verification required
- ✅ Domain validation (@ugm.ac.id)

---

### **4. Database Best Practices**

**User Model:**
- ✅ Unique constraint on email
- ✅ Sparse unique index on nim (allows null)
- ✅ Index on email for fast lookup
- ✅ Separate isVerified and isClaimed flags
- ✅ No password in default queries (use `.select('-password')`)

**Data Validation:**
- ✅ Mongoose schema validation
- ✅ Required fields enforced
- ✅ Email format validation
- ✅ Enum for role field
- ✅ Trim whitespace

---

### **5. Code Organization Best Practices**

```
src/
├── config/          # Configuration files
│   ├── passport.js  # (future: OAuth strategies)
│   └── mongo.js     # MongoDB connection
├── controllers/     # Request handlers
│   └── authController.js
├── services/        # Business logic
│   ├── authService.js
│   ├── otpService.js
│   └── userService.js
├── middlewares/     # Express middlewares
│   ├── auth.js      # JWT verification
│   ├── role.js      # Role-based access
│   └── groupAccess.js
├── models/          # Mongoose schemas
│   └── user.js
├── routes/          # API routes
│   └── authRoutes.js
└── utils/           # Helper functions
    └── cookieUtils.js
```

**Separation of Concerns:**
- ✅ Routes define endpoints
- ✅ Controllers handle HTTP requests/responses
- ✅ Services contain business logic
- ✅ Models define data structure
- ✅ Middlewares handle cross-cutting concerns

---

## 📝 Summary

| Feature | Implementation | Notes |
|---------|----------------|-------|
| **Authentication Type** | JWT-based | Industry standard |
| **Token Strategy** | Single token (24h) | Simple & effective |
| **Token Storage** | httpOnly cookie | XSS protection |
| **Registration** | Email + OTP verification | Prevents bots |
| **OTP Expiry** | 10 minutes | Security & UX balance |
| **Password Hash** | bcrypt (salt: 10) | Industry standard |
| **Email Domains** | @ugm.ac.id, @mail.ugm.ac.id | Auto role assignment |
| **Roles** | admin, dosen, alumni, mahasiswa, guest | Flexible RBAC |
| **User Fields** | email, password, name, role, nim, prodi | Optional nim/prodi |
| **Pre-populated Users** | Admin can create unclaimed | Workflow flexibility |
| **Cookie Security** | httpOnly, secure, sameSite | Multi-layer protection |
| **Middleware** | auth, role, groupAccess | Modular access control |

---

## 🔗 Related Documentation

- **API Endpoints:** See `API_ENDPOINTS.md` for complete API reference
- **User Management:** Role-based access control details
- **Group Management:** Group membership and access control
- **Capstone Management:** Project access control based on approval status

---

## 📈 Future Improvements

**Potential Enhancements:**
- 🔄 Refresh token system (if 24h is too short)
- 🔐 Two-factor authentication (2FA)
- 📱 SMS OTP alternative
- 🔑 OAuth integration (Google, Microsoft)
- 📊 Login history and analytics
- 🚫 Account lockout after failed attempts
- 📧 Email templates with branding
- 🔔 Security notifications (new login, password change)
- ⏰ Configurable token expiry by role
- 🗄️ Redis for OTP storage (scalability)

---

**Last Updated:** November 12, 2025  
**Version:** 2.0 (Single Token + OTP System)  
**Author:** BEPAW3 Team

