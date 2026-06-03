const mongoose = require('mongoose');

const violationSchema = new mongoose.Schema({
  videoId:     { type: String, required: true },
  frameId:     { type: Number, required: true },
  timestamp:   { type: Number, required: true },
  vehicleId:   { type: Number, index: true },
  type:        { type: String, required: true },
  severity:    { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'LOW' },
  confidence:  { type: Number, required: true },
  imageUrl:    { type: String, required: true },
  boxData: {
    x: Number, y: Number, w: Number, h: Number, label: String
  },
  vehicleType:    { type: String },
  numberPlate:    { type: String, default: 'UNKNOWN' },
  location:       { type: String, default: 'Main Intersection A' },
  applicableRule: { type: String },   // e.g. "Motor Vehicles Act, 1988 - Section 194D"
  explanation: {
    reason: String,
    rule:   String,
    action: String,
    applicable_law: String
  },
  // Admin workflow: pending → submitted (fine issued) | flagged (needs review) | cleared
  status: {
    type: String,
    enum: ['pending', 'submitted', 'flagged', 'cleared'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Violation', violationSchema);
