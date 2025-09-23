const connectDB = require('./config/mongo');
const express = require('express');
require('dotenv').config();
const passport = require('passport');
require('./config/passport');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(passport.initialize());

// Routes
app.use('/api/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
