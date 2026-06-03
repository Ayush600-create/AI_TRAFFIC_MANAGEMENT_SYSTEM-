const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  path: { type: String, required: true },
  id: { type: String, required: true, unique: true },
  status: { type: String, enum: ['uploaded', 'processing', 'completed', 'failed'], default: 'uploaded' },
  totalFrames: { type: Number, default: 0 },
  processedFrames: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Video', videoSchema);
