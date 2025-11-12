# 🔐 Authentication System - Login & Register Flow

## 📋 Table of Contents
- [Overview](#overview)
- [Domain Validation](#domain-validation)
- [Registration Flow](#registration-flow)
- [Login Flow](#login-flow)
- [OTP Verification](#otp-verification)
- [Token System](#token-system)
- [Account Claiming](#account-claiming)
- [Error Handling](#error-handling)

---

## 🎯 Overview

Sistem authentication BEPAW3 menggunakan:
- ✅ **Email + Password** authentication
- ✅ **OTP Verification** via email
- ✅ **JWT Token** dengan 1 day expiry
- ✅ **Domain Validation** (UGM only)
- ✅ **Pre-populated User** support (account claiming)
- ❌ **NO** Google OAuth (removed)
- ❌ **NO** Refresh Token (simplified)

---

## 🌐 Domain Validation

### **Allowed Email Domains:**

| Domain | Auto Role | Description |
|--------|-----------|-------------|
| `@mail.ugm.ac.id` | `mahasiswa` | Mahasiswa UGM (dapat diubah ke `alumni`) |
| `@ugm.ac.id` | `dosen` | Dosen UGM |
| Other domains | ❌ **REJECTED** | Tidak diperbolehkan |

### **Special Exception:**
- Email `imutbobo00@gmail.com` → role `admin` (testing only)

### **Code Implementation:**
```javascript
// src/services/authService.js
const isUGMMahasiswa = email.endsWith("@mail.ugm.ac.id");
const isUGMAdmin = email.endsWith("@ugm.ac.id");
const isTestAdmin = email === "imutbobo00@gmail.com";

if (!isUGMMahasiswa && !isUGMAdmin && !isTestAdmin) {
  throw new Error("Email must use @mail.ugm.ac.id or @ugm.ac.id domain");
}
```

---

## 📝 Registration Flow

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ REGISTRATION FLOW                                            │
└─────────────────────────────────────────────────────────────┘

User Input
  ├─ name
  ├─ email
  └─ password
     │
     ▼
[1] Domain Validation
     ├─ @mail.ugm.ac.id? → Continue
     ├─ @ugm.ac.id? → Continue
     └─ Other? → ❌ REJECT
     │
     ▼
[2] Check Email Exists?
     │
     ├─ YES → [3a] Pre-populated User? (no password)
     │         ├─ YES → Claim Account (update name & password)
     │         └─ NO → ❌ "Email sudah terdaftar"
     │
     └─ NO → [3b] Create New User
               ├─ Hash password
               ├─ Set role based on domain
               ├─ Generate OTP
               └─ Save to database
     │
     ▼
[4] Send OTP Email
     ├─ Success → Return { email, needVerification: true }
     └─ Failed → Delete user & throw error
```

### **API Endpoint:**

**POST** `/api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Response - New User:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "needVerification": true,
  "message": "Registrasi berhasil. Cek email untuk kode OTP"
}
```

**Response - Claiming Pre-populated User:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "needVerification": true,
  "message": "Akun berhasil diklaim. Cek email untuk OTP."
}
```

**Response - Error:**
```json
{
  "message": "Email sudah terdaftar"
}
```

### **Auto Role Assignment:**

```javascript
let role = "guest";
if (email.endsWith("@mail.ugm.ac.id")) role = "mahasiswa";
else if (email.endsWith("@ugm.ac.id")) role = "dosen";
else if (email === "imutbobo00@gmail.com") role = "admin";
```

### **Password Security:**
```javascript
const bcrypt = require("bcryptjs");
const hashedPassword = await bcrypt.hash(password, 10);
```

### **OTP Generation:**
```javascript
// src/services/otpService.js
const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
```

---

## 🔑 Login Flow

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ LOGIN FLOW                                                   │
└─────────────────────────────────────────────────────────────┘

User Input
  ├─ email
  └─ password
     │
     ▼
[1] Domain Validation
     ├─ @mail.ugm.ac.id? → Continue
     ├─ @ugm.ac.id? → Continue
     └─ Other? → ❌ REJECT
     │
     ▼
[2] Find User by Email
     ├─ Not found? → ❌ "Email tidak ditemukan"
     └─ Found → Continue
     │
     ▼
[3] Check User Status
     ├─ isClaimed = false? → ❌ "Akun belum diaktifkan"
     ├─ password = null? → ❌ "Akun belum diaktifkan"
     └─ Both OK → Continue
     │
     ▼
[4] Verify Password
     ├─ bcrypt.compare(password, user.password)
     ├─ Match? → Continue
     └─ Not match? → ❌ "Password salah"
     │
     ▼
[5] Generate JWT Token
     ├─ Payload: { id, email, role }
     ├─ Expiry: 1 day
     └─ Secret: process.env.JWT_SECRET
     │
     ▼
[6] Set HttpOnly Cookie
     │
     ▼
✅ Return { user, token, expiresIn }
```

### **API Endpoint:**

**POST** `/api/auth/login`

**Request:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "password": "securePassword123"
}
```

**Response - Success:**
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Response - Pre-populated User (Not Claimed):**
```json
{
  "message": "Akun belum diaktifkan. Silakan register terlebih dahulu untuk mengaktifkan akun."
}
```

**Response - Wrong Password:**
```json
{
  "message": "Password salah"
}
```

**Response - Email Not Found:**
```json
{
  "message": "Email tidak ditemukan"
}
```

### **Cookie Settings:**
```javascript
// src/utils/cookieUtils.js
res.cookie('token', token, {
  httpOnly: true,      // Prevent XSS attacks
  secure: false,       // Set to true in production (HTTPS)
  sameSite: 'lax',
  maxAge: 24 * 60 * 60 * 1000  // 1 day
});
```

---

## ✉️ OTP Verification

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ OTP VERIFICATION FLOW                                        │
└─────────────────────────────────────────────────────────────┘

User Input
  ├─ email
  └─ otp (6 digits)
     │
     ▼
[1] Find User by Email
     ├─ Not found? → ❌ "User tidak ditemukan"
     └─ Found → Continue
     │
     ▼
[2] Verify OTP
     ├─ OTP match? ✅
     ├─ OTP expired? ❌ "OTP sudah expired"
     └─ OTP wrong? ❌ "OTP tidak valid"
     │
     ▼
[3] Update User
     ├─ isVerified = true
     ├─ otp = undefined
     └─ otpExpiry = undefined
     │
     ▼
[4] Generate JWT Token
     │
     ▼
[5] Set HttpOnly Cookie
     │
     ▼
✅ Auto Login - Return { user, token }
```

### **API Endpoint:**

**POST** `/api/auth/verify-otp`

**Request:**
```json
{
  "email": "john@mail.ugm.ac.id",
  "otp": "123456"
}
```

**Response - Success (Auto Login):**
```json
{
  "message": "OTP berhasil diverifikasi",
  "user": {
    "id": "64f7b1234567890abcdef123",
    "name": "John Doe",
    "email": "john@mail.ugm.ac.id",
    "role": "mahasiswa",
    "isVerified": true
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400
}
```

**Response - Error:**
```json
{
  "message": "OTP tidak valid atau sudah expired"
}
```

### **OTP Expiry:**
```javascript
const now = new Date();
const otpExpiry = user.otpExpiry;

if (now > otpExpiry) {
  return { valid: false, message: "OTP sudah expired" };
}
```

---

## 🎫 Token System

### **Token Structure:**

```javascript
// JWT Payload
{
  "id": "user_id",
  "email": "user@mail.ugm.ac.id",
  "role": "mahasiswa",
  "iat": 1699776000,      // Issued At
  "exp": 1699862400       // Expiry (1 day later)
}
```

### **Token Generation:**

```javascript
// src/services/tokenService.js
const jwt = require("jsonwebtoken");

const generateUserToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role
  };
  
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "1d"  // 1 day
  });
  
  return {
    token,
    expiresIn: 86400  // 24 * 60 * 60 seconds
  };
};
```

### **Token Verification:**

```javascript
// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

// Check from Authorization header OR cookie
const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

if (!token) {
  return res.status(401).json({ 
    message: "Access token required",
    code: "NO_TOKEN" 
  });
}

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;  // { id, email, role }
  next();
} catch (error) {
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ 
      message: "Token expired",
      code: "TOKEN_EXPIRED" 
    });
  }
  return res.status(401).json({ 
    message: "Invalid token",
    code: "INVALID_TOKEN" 
  });
}
```

### **Using Token in Requests:**

**Option 1: Authorization Header**
```http
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Option 2: Cookie (Automatic)**
```javascript
// Cookie automatically sent by browser
fetch('/api/users', {
  credentials: 'include'  // Include cookies
});
```

---

## 👥 Account Claiming (Pre-populated Users)

### **What is Account Claiming?**

Admin dapat membuat user terlebih dahulu di database (hanya email + role), kemudian user yang sebenarnya dapat **"claim"** akun tersebut saat register pertama kali.

### **Flow Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│ ACCOUNT CLAIMING FLOW                                        │
└─────────────────────────────────────────────────────────────┘

[Admin Creates Pre-populated User]
  ├─ email: "student@mail.ugm.ac.id"
  ├─ role: "mahasiswa"
  ├─ password: null               ← No password yet
  ├─ isClaimed: false             ← Not claimed yet
  └─ name: null (optional)
     │
     ▼
[User Registers with Same Email]
  ├─ email: "student@mail.ugm.ac.id"
  ├─ password: "newPassword123"
  └─ name: "Student Name"
     │
     ▼
[System Detects Pre-populated User]
  ├─ Email exists? ✅
  ├─ password = null? ✅
  └─ isClaimed = false? ✅
     │
     ▼
[Update User (Claim Account)]
  ├─ name = "Student Name"       ← Set name
  ├─ password = hash(password)   ← Set password
  ├─ isClaimed = true            ← Mark as claimed
  ├─ Generate OTP
  └─ Send verification email
     │
     ▼
✅ Account Claimed - Proceed to OTP verification
```

### **Database States:**

**Before Claiming:**
```json
{
  "_id": "...",
  "email": "student@mail.ugm.ac.id",
  "role": "mahasiswa",
  "name": null,
  "password": null,
  "isClaimed": false,
  "isVerified": false
}
```

**After Claiming:**
```json
{
  "_id": "...",
  "email": "student@mail.ugm.ac.id",
  "role": "mahasiswa",
  "name": "Student Name",
  "password": "$2a$10$hashed...",
  "isClaimed": true,
  "isVerified": false,  // Still needs OTP verification
  "otp": "123456",
  "otpExpiry": "2025-11-12T10:45:00.000Z"
}
```

### **Code Implementation:**

```javascript
// src/services/authService.js - register()
let existing = await User.findOne({ email });

if (existing) {
  // Check if already claimed
  if (existing.password && existing.isClaimed) {
    throw new Error("Email sudah terdaftar");
  }
  
  // Pre-populated user - claim it!
  if (!existing.password || !existing.isClaimed) {
    const hashed = await bcrypt.hash(password, 10);
    
    existing.name = name;
    existing.password = hashed;
    existing.isClaimed = true;
    existing.otp = otpService.generateOTP();
    existing.otpExpiry = otpService.generateOTPExpiry();
    existing.isVerified = false;
    
    await existing.save();
    
    // Send OTP
    await otpService.sendOTPEmail(email, existing.otp, "verification");
    
    return { 
      email, 
      needVerification: true,
      message: "Akun berhasil diklaim. Cek email untuk OTP."
    };
  }
}
```

### **Login Blocking:**

```javascript
// src/services/authService.js - login()
const user = await User.findOne({ email });

// Block login if account not claimed
if (!user.password || !user.isClaimed) {
  throw new Error("Akun belum diaktifkan. Silakan register terlebih dahulu untuk mengaktifkan akun.");
}
```

---

## ❌ Error Handling

### **Common Errors:**

| Error | HTTP Code | Message | Cause |
|-------|-----------|---------|-------|
| **Invalid Domain** | 400 | Email must use @mail.ugm.ac.id or @ugm.ac.id | Wrong email domain |
| **Email Exists** | 400 | Email sudah terdaftar | Duplicate registration |
| **Email Not Found** | 401 | Email tidak ditemukan | Login with non-existent email |
| **Wrong Password** | 401 | Password salah | Incorrect password |
| **Not Claimed** | 401 | Akun belum diaktifkan | Pre-populated user not claimed |
| **Invalid OTP** | 400 | OTP tidak valid | Wrong OTP code |
| **Expired OTP** | 400 | OTP sudah expired | OTP older than 10 minutes |
| **No Token** | 401 | Access token required | Missing authentication |
| **Token Expired** | 401 | Token expired | Token older than 1 day |
| **Invalid Token** | 401 | Invalid token | Malformed or tampered token |

### **Error Response Format:**

```json
{
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### **Frontend Error Handling Example:**

```javascript
async function login(email, password) {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific errors
      switch (data.message) {
        case "Email tidak ditemukan":
          alert("Email belum terdaftar. Silakan register.");
          break;
        case "Password salah":
          alert("Password yang Anda masukkan salah.");
          break;
        case "Akun belum diaktifkan. Silakan register terlebih dahulu untuk mengaktifkan akun.":
          alert("Akun Anda sudah dibuat oleh admin. Silakan register untuk aktivasi.");
          window.location.href = "/register";
          break;
        default:
          alert(data.message);
      }
      return;
    }
    
    // Success - store token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    window.location.href = "/dashboard";
    
  } catch (error) {
    console.error("Login error:", error);
    alert("Terjadi kesalahan. Silakan coba lagi.");
  }
}
```

---

## 🔄 Complete User Journey

### **Scenario 1: New User Registration**

```
1. User visits /register
2. Fills form: name, email@mail.ugm.ac.id, password
3. POST /api/auth/register
4. ✅ Account created, OTP sent to email
5. User checks email, gets OTP: 123456
6. Enters OTP in verification page
7. POST /api/auth/verify-otp
8. ✅ Account verified, auto login, redirect to dashboard
```

### **Scenario 2: Pre-populated User Claiming**

```
1. Admin creates user: email@mail.ugm.ac.id, role: mahasiswa
2. User visits /register
3. Fills form: name, email@mail.ugm.ac.id, password
4. POST /api/auth/register
5. ✅ Account claimed, OTP sent to email
6. User verifies OTP
7. POST /api/auth/verify-otp
8. ✅ Account activated, auto login, redirect to dashboard
```

### **Scenario 3: Returning User Login**

```
1. User visits /login
2. Fills form: email@mail.ugm.ac.id, password
3. POST /api/auth/login
4. ✅ Login success, token received
5. Redirect to dashboard
6. Token stored in cookie (httpOnly)
7. All subsequent API calls include token automatically
```

### **Scenario 4: Token Expiry**

```
1. User logged in, using app normally
2. After 24 hours, token expires
3. Next API call: GET /api/users
4. ❌ Response: 401 "Token expired"
5. Frontend detects expired token
6. Redirect to /login
7. User logs in again
8. ✅ New token issued, continue using app
```

---

## 🛡️ Security Best Practices

### **1. Password Hashing**
```javascript
// Always hash passwords with bcrypt
const hashedPassword = await bcrypt.hash(password, 10);
```

### **2. HttpOnly Cookies**
```javascript
// Prevent XSS attacks
res.cookie('token', token, {
  httpOnly: true,  // Cannot be accessed by JavaScript
  secure: true,    // HTTPS only in production
  sameSite: 'lax'
});
```

### **3. JWT Secret**
```javascript
// Strong secret key in .env
JWT_SECRET=your-super-secret-key-min-32-characters
```

### **4. OTP Expiry**
```javascript
// OTP valid for 10 minutes only
const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
```

### **5. Email Validation**
```javascript
// Strict domain validation
const allowedDomains = ['@mail.ugm.ac.id', '@ugm.ac.id'];
```

---

## 📊 Database Schema

### **User Model:**

```javascript
{
  name: String,
  email: { type: String, unique: true, required: true },
  password: String,  // Optional for pre-populated users
  role: { 
    type: String, 
    enum: ["admin", "dosen", "alumni", "mahasiswa", "guest"],
    default: "guest" 
  },
  otp: String,
  otpExpiry: Date,
  isVerified: { type: Boolean, default: false },
  isClaimed: { type: Boolean, default: false }
}
```

---

## 🚀 Quick Reference

### **Registration:**
```bash
POST /api/auth/register
Body: { name, email, password }
→ Returns: { email, needVerification: true }
```

### **OTP Verification:**
```bash
POST /api/auth/verify-otp
Body: { email, otp }
→ Returns: { user, token } + Auto login
```

### **Login:**
```bash
POST /api/auth/login
Body: { email, password }
→ Returns: { user, token }
```

### **Logout:**
```bash
POST /api/auth/logout
Headers: Authorization: Bearer <token>
→ Returns: { message: "Logout berhasil" }
```

### **Protected Endpoint:**
```bash
GET /api/users
Headers: Authorization: Bearer <token>
→ Requires valid token
```

---

**Last Updated:** November 12, 2025  
**Version:** 1.0
