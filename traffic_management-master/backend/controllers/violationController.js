const Violation = require('../models/Violation');

exports.getAllViolations = async (req, res) => {
  try {
    const violations = await Violation.find().sort({ createdAt: -1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getViolationsByVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const violations = await Violation.find({ videoId }).sort({ frameId: 1 });
    res.json(violations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getViolationById = async (req, res) => {
  try {
    const violation = await Violation.findById(req.params.id);
    if (!violation) return res.status(404).json({ error: 'Violation not found' });
    res.json(violation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateViolationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const violation = await Violation.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(violation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
