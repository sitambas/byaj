import { Router } from 'express';
import { uploadKYC } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Error handling middleware for multer
const handleUploadError = (err: any, req: any, res: any, next: any) => {
  if (err instanceof Error) {
    if (err.message.includes('Only image files')) {
      return res.status(400).json({ error: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds 5MB limit' });
    }
    return res.status(400).json({ error: err.message || 'File upload error' });
  }
  next(err);
};

// Upload KYC document
router.post('/kyc', authenticate, upload.single('file'), handleUploadError, uploadKYC);

export default router;

