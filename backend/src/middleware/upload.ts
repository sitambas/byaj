import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads', 'kyc');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads directory: ${uploadsDir}`);
} else {
  console.log(`📁 Uploads directory exists: ${uploadsDir}`);
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter - only images and PDFs
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  // Check mimetype - be more lenient with image/jpeg, image/jpg, image/png, application/pdf
  const allowedMimeTypes = /^image\/(jpeg|jpg|png)|^application\/pdf$/;
  const mimetype = allowedMimeTypes.test(file.mimetype.toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Only JPEG, JPG, PNG images and PDF files are allowed. Received: ${file.mimetype}`));
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Helper to get file URL
export const getFileUrl = (filename: string): string => {
  return `/uploads/kyc/${filename}`;
};

