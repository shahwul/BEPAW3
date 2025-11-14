const connectDB = require('./config/mongo');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const cron = require('node-cron');
require('dotenv').config();
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const capstoneRoutes = require('./routes/capstoneRoutes');
const groupRoutes = require('./routes/groupRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const requestCleanupService = require('./services/requestCleanupService');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000'];

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, only allow whitelisted origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/capstones', capstoneRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Start the server
const PORT = process.env.PORT || 5000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Setup cron job untuk auto-reject expired requests
// Berjalan setiap hari jam 00:00 (midnight)
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Running auto-reject expired requests job...');
  try {
    const result = await requestCleanupService.autoRejectExpiredRequests();
    console.log(`[CRON] Auto-reject completed: ${result.rejected} requests rejected, ${result.capstoneUpdated.length} capstones updated`);
  } catch (error) {
    console.error('[CRON] Auto-reject failed:', error.message);
  }
}, {
  timezone: "Asia/Jakarta" // Sesuaikan dengan timezone Anda
});

console.log('[CRON] Auto-reject scheduler initialized (runs daily at 00:00 WIB)');
