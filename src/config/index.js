require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 2 * 1024 * 1024,
  categories: ['electronics', 'clothing', 'food', 'other'],
  allowedMimeTypes: ['image/jpeg', 'image/png'],
};
