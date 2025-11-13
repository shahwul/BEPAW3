const express = require("express");
const capstoneController = require("../controllers/capstoneController");
const auth = require("../middlewares/auth");
const optionalAuth = require("../middlewares/optionalAuth");
const role = require("../middlewares/role");
const { uploadImage } = require("../middlewares/upload");
const multer = require('multer');

const router = express.Router();

// Combined upload middleware for both images (disk) and PDF (memory)
const uploadFields = multer({
  storage: multer.memoryStorage(), // Use memory storage for Google Drive upload
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'hasil') {
      // Check for images
      const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedImageTypes.test(require('path').extname(file.originalname).toLowerCase());
      const mimetype = allowedImageTypes.test(file.mimetype);
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Hanya file gambar yang diperbolehkan untuk hasil (jpeg, jpg, png, gif, webp)'));
      }
    } else if (file.fieldname === 'proposal') {
      // Check for PDF
      const isPdf = file.mimetype === 'application/pdf';
      if (isPdf) {
        return cb(null, true);
      } else {
        cb(new Error('Hanya file PDF yang diperbolehkan untuk proposal'));
      }
    } else {
      cb(new Error('Field tidak dikenal'));
    }
  }
}).fields([
  { name: 'hasil', maxCount: 2 },
  { name: 'proposal', maxCount: 1 }
]);

// Upload gambar hasil dan proposal PDF
router.post("/", auth, role(["admin"]), uploadFields, capstoneController.createCapstone);
router.get("/stats", auth, role(["admin"]), capstoneController.getCapstoneStats); // Admin stats
router.get("/search", optionalAuth, capstoneController.searchCapstones); // Public with optional auth
router.get("/", optionalAuth, capstoneController.getAllCapstones); // Public with optional auth
router.get("/:id", optionalAuth, capstoneController.getCapstoneDetail); // Public with optional auth
router.put("/:id", auth, role(["admin"]), uploadFields, capstoneController.updateCapstone);
router.delete("/:id", auth, role(["admin"]), capstoneController.deleteCapstone);

module.exports = router;
