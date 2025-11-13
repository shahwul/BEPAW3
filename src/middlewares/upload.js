const multer = require('multer');
const path = require('path');

// Configure disk storage (untuk backward compatibility)
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp'); // Temporary storage
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure memory storage (untuk Google Drive upload)
const memoryStorage = multer.memoryStorage();

// File filter - only images
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan (jpeg, jpg, png, gif, webp)'));
  }
};

// File filter - only PDF
const pdfFilter = (req, file, cb) => {
  const allowedTypes = /pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Hanya file PDF yang diperbolehkan'));
  }
};

// Multer upload configuration for images
const uploadImage = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  },
  fileFilter: imageFilter
});

// Multer upload configuration for PDF (disk storage)
const uploadPDF = multer({
  storage: diskStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size for PDF
  },
  fileFilter: pdfFilter
});

// Multer upload configuration for PDF (memory storage - untuk Google Drive)
const uploadPDFMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size for PDF
  },
  fileFilter: pdfFilter
});

module.exports = {
  uploadImage,
  uploadPDF,
  uploadPDFMemory
};
