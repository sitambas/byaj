import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getFileUrl } from '../middleware/upload';

export const uploadKYC = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      console.error('Upload failed: Unauthorized - no userId');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Upload request received:', {
      userId,
      hasFile: !!req.file,
      fileInfo: req.file ? {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      } : null,
    });

    if (!req.file) {
      console.error('Upload failed: No file in request');
      return res.status(400).json({ 
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    const fileUrl = getFileUrl(req.file.filename);

    console.log('Upload successful:', {
      filename: req.file.filename,
      url: fileUrl,
    });

    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to upload file',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

