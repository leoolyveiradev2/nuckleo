// Multer (PDF, imagens, código) - Placeholder
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { createError } = require('../utils/errorUtils');

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

// Ensure upload dirs exist
['images', 'pdfs', 'code', 'misc'].forEach((dir) => {
  fs.mkdirSync(path.join(UPLOAD_DIR, dir), { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const mime = file.mimetype;
    let subDir = 'misc';
    if (mime.startsWith('image/')) subDir = 'images';
    else if (mime === 'application/pdf') subDir = 'pdfs';
    else if (mime.startsWith('text/')) subDir = 'code';
    cb(null, path.join(UPLOAD_DIR, subDir));
  },
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'application/pdf',
    'text/plain', 'text/html', 'text/css', 'text/javascript',
    'application/json', 'application/xml',
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(createError(`File type not allowed: ${file.mimetype}`, 400), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

module.exports = upload;
