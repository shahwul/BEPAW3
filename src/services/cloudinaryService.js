const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload single image to Cloudinary
 * @param {Object} file - File object from multer (supports both disk and memory storage)
 * @param {String} folder - Cloudinary folder name (e.g., 'capstone-hasil')
 * @returns {Object} - { success, url, publicId, error }
 */
exports.uploadImage = async (file, folder = 'capstone') => {
  try {
    let uploadSource;
    
    // Check if file is from memory storage (buffer) or disk storage (path)
    if (file.buffer) {
      // Memory storage - convert buffer to base64
      uploadSource = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    } else if (file.path) {
      // Disk storage - use file path
      uploadSource = file.path;
    } else {
      throw new Error('Invalid file object - no buffer or path');
    }

    // Upload to Cloudinary with transformations
    const result = await cloudinary.uploader.upload(uploadSource, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max size 1200x1200
        { quality: 'auto' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
      ]
    });

    // Delete temp file after upload (only for disk storage)
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      width: result.width,
      height: result.height,
      bytes: result.bytes
    };
  } catch (error) {
    // Delete temp file if upload failed (only for disk storage)
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload multiple images to Cloudinary (max 2 for hasil)
 * @param {Array} files - Array of file objects from multer (supports both disk and memory storage)
 * @param {String} folder - Cloudinary folder name
 * @param {Number} maxFiles - Maximum number of files allowed
 * @returns {Object} - { success, urls, errors }
 */
exports.uploadMultipleImages = async (files, folder = 'capstone', maxFiles = 2) => {
  try {
    // Validate max files
    if (files.length > maxFiles) {
      // Delete all temp files (only for disk storage)
      files.forEach(file => {
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });

      return {
        success: false,
        error: `Maksimal ${maxFiles} gambar`
      };
    }

    const uploadPromises = files.map(file => this.uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);

    const successResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    if (failedResults.length > 0) {
      return {
        success: false,
        error: `Gagal upload ${failedResults.length} gambar`,
        details: failedResults
      };
    }

    return {
      success: true,
      urls: successResults.map(r => r.url),
      images: successResults
    };
  } catch (error) {
    // Cleanup temp files on error (only for disk storage)
    files.forEach(file => {
      if (file.path && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });

    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Object} - { success, error }
 */
exports.deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array} publicIds - Array of Cloudinary public IDs
 * @returns {Object} - { success, deleted, failed }
 */
exports.deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map(id => this.deleteImage(id));
    const results = await Promise.all(deletePromises);

    const deleted = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return {
      success: failed === 0,
      deleted,
      failed
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {String} url - Cloudinary URL
 * @returns {String} - Public ID
 */
exports.extractPublicId = (url) => {
  try {
    // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/folder/image.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    
    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v123/'
    const pathParts = parts.slice(uploadIndex + 2); // Skip 'upload' and version
    const publicIdWithExt = pathParts.join('/');
    
    // Remove file extension
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');
    
    return publicId;
  } catch (error) {
    return null;
  }
};

/**
 * Upload PDF file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
exports.uploadPDF = async (file, folder = 'capstone-proposals') => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image', // Use 'image' for PDF to enable browser preview
      public_id: `proposal-${Date.now()}`
    });

    // Delete temp file after upload
    fs.unlinkSync(file.path);

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    // Clean up temp file on error
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    return {
      success: false,
      error: error.message
    };
  }
};
