// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import prisma from './config/database';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware - CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://localhost:3002', 'http://localhost:3001'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, or curl requests)
    if (!origin) {
      return callback(null, true);
    }
    
    // In development, allow all localhost origins
    if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'ByajBook API is running' });
});

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'ByajBook API v1' });
});

// Import routes
import authRoutes from './routes/authRoutes';
import bookRoutes from './routes/bookRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import personRoutes from './routes/personRoutes';
import loanRoutes from './routes/loanRoutes';

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/people', personRoutes);
app.use('/api/loans', loanRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableRoutes: [
      'GET /health',
      'GET /api',
      'POST /api/auth/login',
      'POST /api/auth/verify',
      'GET /api/auth/me',
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

