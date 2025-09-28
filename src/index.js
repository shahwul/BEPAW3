const connectDB = require('./config/mongo');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const passport = require('passport');
require('./config/passport');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const capstoneRoutes = require('./routes/capstoneRoutes');
const groupRoutes = require('./routes/groupRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true // Allow cookies to be sent
}));
app.use(express.json());
app.use(cookieParser()); // Parse cookies
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/capstones', capstoneRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
