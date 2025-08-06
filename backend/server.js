const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const { PORT, MONGO_URI } = require('./config/config');

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('LawPilot Backend Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
