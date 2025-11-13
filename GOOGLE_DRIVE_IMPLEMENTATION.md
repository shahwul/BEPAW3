# Implementasi Google Drive untuk Capstone Proposals

## Overview

Proyek ini menggunakan **Google Drive API** untuk menyimpan file proposal capstone (PDF). File proposal diupload ke Google Drive dengan permission publik, sehingga dapat diakses oleh user yang memiliki akses.

---

## Arsitektur

### 1. **Konfigurasi Google Drive** (`src/config/googleDrive.js`)

```javascript
const { google } = require("googleapis");
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json",
  scopes: ["https://www.googleapis.com/auth/drive"]
});
const drive = google.drive({ version: "v3", auth });
```

- Menggunakan **Service Account** untuk autentikasi
- Scope: `https://www.googleapis.com/auth/drive` (full access)
- File credentials: `credentials.json` di root project

### 2. **Model Database** (`src/models/capstone.js`)

Field baru yang ditambahkan:

```javascript
{
  proposalFileId: { type: String },  // Google Drive File ID
  proposalUrl: { type: String },     // Web View Link (cached)
  proposal: { type: String }          // (Deprecated - backward compatibility)
}
```

### 3. **Upload Middleware** (`src/middlewares/upload.js`)

- **Memory Storage**: File disimpan di buffer (tidak di disk)
- Mendukung upload PDF hingga 10MB
- File filter: hanya PDF yang diperbolehkan

### 4. **Service Layer** (`src/services/capstoneService.js`)

Implementasi operasi Google Drive:

#### **A. Create Capstone - Upload File**

```javascript
// Convert buffer to stream
const bufferStream = Readable.from(files.proposal.buffer);

// Upload to Google Drive
const driveFile = await drive.files.create({
  requestBody: {
    name: `${judul}_proposal_${Date.now()}.pdf`,
    parents: [process.env.GOOGLE_DRIVE_FOLDER_ID]
  },
  media: {
    mimeType: 'application/pdf',
    body: bufferStream
  },
  fields: 'id, name, webViewLink',
  supportsAllDrives: true
});

// Set public permission
await drive.permissions.create({
  fileId: driveFile.data.id,
  requestBody: {
    role: 'reader',
    type: 'anyone'
  },
  supportsAllDrives: true
});

// Get shareable link
const file = await drive.files.get({
  fileId: driveFile.data.id,
  fields: 'webViewLink',
  supportsAllDrives: true
});
```

#### **B. Update Capstone - Replace File**

1. Delete old file from Google Drive
2. Upload new file
3. Create permission
4. Update database

#### **C. Delete Capstone - Remove File**

```javascript
await drive.files.delete({
  fileId: capstone.proposalFileId,
  supportsAllDrives: true
});
```

#### **D. Access Control**

- **Admin**: selalu bisa akses `proposalUrl`
- **Non-admin**: hanya bisa akses jika ada approved request dari group mereka

---

## Environment Variables

Tambahkan di `.env`:

```env
GOOGLE_DRIVE_FOLDER_ID=<folder_id_untuk_menyimpan_file>
```

Cara mendapatkan Folder ID:
1. Buka Google Drive
2. Buat folder atau pilih folder yang sudah ada
3. Klik kanan → Share → Add service account email
4. Copy folder ID dari URL: `https://drive.google.com/drive/folders/<FOLDER_ID>`

---

## Service Account Setup

### 1. Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable **Google Drive API**
4. Buat Service Account:
   - IAM & Admin → Service Accounts → Create Service Account
   - Beri nama (misal: `capstone-container`)
   - Download JSON key file → simpan sebagai `credentials.json`

### 2. Permissions di Google Drive

1. Buka Google Drive
2. Pilih folder untuk menyimpan proposal
3. Klik Share
4. Add service account email (dari `credentials.json`):
   ```
   capstone-container@paw-3-472910.iam.gserviceaccount.com
   ```
5. Beri akses **Editor**

---

## API Endpoints

### **POST /api/capstones**

Create capstone dengan proposal PDF.

**Request:**
```bash
POST /api/capstones
Content-Type: multipart/form-data

{
  "judul": "Sistem Pemilahan Sampah Otomatis",
  "kategori": "Pengolahan Sampah",
  "ketua": "673abc123def456...",
  "anggota": ["673abc789def123..."],
  "dosen": "673def456abc789...",
  "abstrak": "Deskripsi...",
  "proposal": <PDF_FILE>  // Binary file
}
```

**Response:**
```json
{
  "_id": "673abc...",
  "judul": "Sistem Pemilahan Sampah Otomatis",
  "proposalFileId": "1a2b3c4d5e6f...",
  "proposalUrl": "https://drive.google.com/file/d/1a2b3c4d5e6f.../view",
  ...
}
```

### **PUT /api/capstones/:id**

Update capstone (termasuk mengganti proposal PDF).

**Request:**
```bash
PUT /api/capstones/673abc...
Content-Type: multipart/form-data

{
  "judul": "Updated Title",
  "proposal": <NEW_PDF_FILE>  // Optional - jika ingin ganti file
}
```

### **GET /api/capstones**

Get all capstones.

**Response (Admin):**
```json
[
  {
    "_id": "673abc...",
    "judul": "...",
    "proposalUrl": "https://drive.google.com/file/d/.../view"  // Visible
  }
]
```

**Response (Non-Admin - No Access):**
```json
[
  {
    "_id": "673abc...",
    "judul": "..."
    // proposalUrl not included
  }
]
```

### **DELETE /api/capstones/:id**

Delete capstone (also deletes file from Google Drive).

---

## Flow Diagram

```
┌──────────────┐
│   Frontend   │
└──────┬───────┘
       │ POST /api/capstones
       │ (with PDF file)
       ▼
┌──────────────────┐
│   capstoneRoutes │
└──────┬───────────┘
       │ uploadFields middleware
       │ (multer memory storage)
       ▼
┌──────────────────────┐
│ capstoneController   │
└──────┬───────────────┘
       │ createCapstone()
       ▼
┌──────────────────────┐
│  capstoneService     │
└──────┬───────────────┘
       │
       ├─► Convert buffer to stream
       │
       ├─► Upload to Google Drive
       │   • drive.files.create()
       │
       ├─► Set public permission
       │   • drive.permissions.create()
       │
       ├─► Get shareable link
       │   • drive.files.get()
       │
       └─► Save to MongoDB
           • proposalFileId
           • proposalUrl
```

---

## Error Handling

### Common Errors

1. **"Gagal upload proposal ke Google Drive"**
   - Periksa credentials.json
   - Pastikan service account punya akses ke folder
   - Cek `GOOGLE_DRIVE_FOLDER_ID` di .env

2. **"File not found"** (saat delete)
   - File mungkin sudah dihapus manual dari Drive
   - Error akan di-log tapi proses tetap lanjut

3. **"Permission denied"**
   - Service account tidak punya akses ke folder
   - Share folder dengan service account email

---

## Keamanan

### 1. **Service Account**
- Gunakan Service Account (bukan OAuth User)
- Jangan commit `credentials.json` ke Git
- Tambahkan ke `.gitignore`

### 2. **Access Control**
- File di Google Drive bersifat **public** (anyone with link)
- Access control dilakukan di **aplikasi level**:
  - Admin: selalu bisa akses
  - User: hanya jika ada approved request

### 3. **File Validation**
- Hanya accept PDF files
- Max size: 10MB
- MIME type validation

---

## Monitoring & Logs

### Success Logs
- Upload success: `proposalFileId` tersimpan di database
- Delete success: file terhapus dari Drive

### Error Logs
```javascript
console.error(`Error deleting file from Google Drive: ${error.message}`);
```

### Google Drive Quota
- Check quota: [Google Cloud Console → APIs & Services → Dashboard](https://console.cloud.google.com/apis/dashboard)
- Free tier: 1TB storage

---

## Testing

### 1. Test Upload
```bash
curl -X POST http://localhost:3000/api/capstones \
  -H "Authorization: Bearer <token>" \
  -F "judul=Test Capstone" \
  -F "kategori=Pengolahan Sampah" \
  -F "ketua=<user_id>" \
  -F "anggota=[\"<user_id>\"]" \
  -F "dosen=<dosen_id>" \
  -F "abstrak=Test abstrak" \
  -F "proposal=@/path/to/file.pdf"
```

### 2. Verify in Google Drive
- Login ke Google Drive dengan service account folder
- Check apakah file ter-upload
- Coba akses link dari `proposalUrl`

### 3. Test Access Control
- Login sebagai admin → harus bisa lihat `proposalUrl`
- Login sebagai user biasa → tidak bisa lihat `proposalUrl`
- User request & approved → bisa lihat `proposalUrl`

---

## Migration dari Cloudinary

Jika sebelumnya menggunakan Cloudinary:

1. Field `proposal` (Cloudinary URL) tetap ada untuk backward compatibility
2. Field baru: `proposalFileId` dan `proposalUrl` untuk Google Drive
3. Update existing data:
   ```javascript
   // Manual migration script (jika diperlukan)
   const capstones = await Capstone.find({ proposal: { $exists: true } });
   for (const capstone of capstones) {
     // Re-upload from Cloudinary to Google Drive
     // Update proposalFileId dan proposalUrl
   }
   ```

---

## Best Practices

1. **Caching**: `proposalUrl` disimpan di database untuk menghindari repeated API calls
2. **Error Recovery**: Jika delete gagal, tetap lanjutkan proses
3. **File Naming**: Include timestamp untuk uniqueness
4. **Validation**: Selalu validate file type dan size
5. **Monitoring**: Log semua operasi Google Drive untuk debugging

---

## Dependencies

```json
{
  "googleapis": "^166.0.0",
  "multer": "^2.0.2"
}
```

Install:
```bash
npm install googleapis multer
```

---

## Troubleshooting

### Problem: Upload gagal dengan error "Invalid credentials"

**Solution:**
- Periksa `credentials.json`
- Pastikan path benar di `googleDrive.js`
- Regenerate service account key jika perlu

### Problem: File uploaded tapi link tidak bisa diakses

**Solution:**
- Periksa permission creation
- Pastikan `type: 'anyone'` dan `role: 'reader'`
- Coba akses link dalam incognito mode

### Problem: Folder not found

**Solution:**
- Periksa `GOOGLE_DRIVE_FOLDER_ID` di `.env`
- Pastikan service account punya akses ke folder
- Coba gunakan root folder dulu untuk testing

---

## Support

Untuk issue atau pertanyaan:
1. Check Google Drive API documentation: https://developers.google.com/drive/api/v3/reference
2. Check project logs untuk error details
3. Verify service account permissions di Google Cloud Console
