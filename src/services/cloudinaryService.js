const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

/**
 * Upload single image to Cloudinary
 * @param {Object} file - File object from multer
 * @param {String} folder - Cloudinary folder name (e.g., 'capstone-hasil')
 * @returns {Object} - { success, url, publicId, error }
 */
exports.uploadImage = async (file, folder = 'capstone') => {
  try {
    // Upload to Cloudinary with transformations
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' }, // Max size 1200x1200
        { quality: 'auto' }, // Auto optimize quality
        { fetch_format: 'auto' } // Auto format (WebP for supported browsers)
      ]
    });

    // Delete temp file after upload
    fs.unlinkSync(file.path);

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
    // Delete temp file if upload failed
    if (fs.existsSync(file.path)) {
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
 * @param {Array} files - Array of file objects from multer
 * @param {String} folder - Cloudinary folder name
 * @param {Number} maxFiles - Maximum number of files allowed
 * @returns {Object} - { success, urls, errors }
 */
exports.uploadMultipleImages = async (files, folder = 'capstone', maxFiles = 2) => {
  try {
    // Validate max files
    if (files.length > maxFiles) {
      // Delete all temp files
      files.forEach(file => {
        if (fs.existsSync(file.path)) {
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
    // Cleanup temp files on error
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
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
