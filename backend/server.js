require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const videoRoutes = require('./routes/videoRoutes');
const violationRoutes = require('./routes/violationRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploads, frames, and permanent violations)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/frames', express.static(path.join(__dirname, 'frames')));
app.use('/violations-media', express.static(path.join(__dirname, 'violations')));

// Ensure directories exist
const dirs = ['uploads', 'frames', 'violations'];
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
});

// Routes
app.use('/api/videos', videoRoutes);
app.use('/api/violations', violationRoutes);

// Serve Static Frontend (for Production)
app.use(express.static(path.join(__dirname, '../dist')));

// Catch-all to serve index.html for React Router
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Database Connection
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
