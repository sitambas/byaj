import { Router } from 'express';
import { uploadKYC } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Error handling middleware for multer
// Multer errors are passed as the first parameter (err) to error handlers
const handleUploadError = (err: any, req: any, res: any, next: any) => {
  console.error('Multer error:', err);
  
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    if (err.message && err.message.includes('File type not allowed')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.message && err.message.includes('Only image files')) {
      return res.status(400).json({ error: err.message });
    }
    return res.status(400).json({ 
      error: err.message || 'File upload error',
      code: err.code 
    });
  }
  next(err);
};

// Upload KYC document
// Note: Error handler must be after multer middleware
router.post('/kyc', authenticate, upload.single('file'), handleUploadError, uploadKYC);

export default router;


