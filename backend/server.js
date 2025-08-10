const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const legalChatRoutes = require('./routes/legalChatRoutes');

const { PORT, MONGO_URI, NODE_ENV } = require('./config/config');

const cookieParser = require('cookie-parser');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.use('/auth', authRoutes);
app.use('/legal-chat', legalChatRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${NODE_ENV || 'development'} mode`);
});
