const axios = require('axios');

const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || process.env.PYTHON_AI_SERVICE_URL || (isProd ? null : 'http://localhost:8001');

if (isProd && !PYTHON_SERVICE_URL) {
  throw new Error('PYTHON_AI_SERVICE_URL is not set in production!');
}

/**
 * Sends a frame to the Python ML service for detection and rule-based verification.
 * @param {string} framePath - Absolute path to the frame image.
 * @returns {Promise<Object>} - Detection results including violations.
 */
const analyzeFrame = async (framePath) => {
  try {
    const response = await axios.post(`${PYTHON_SERVICE_URL}/detect`, {
      image_path: framePath
    }, {
      timeout: 10000 // 10 seconds timeout
    });
    return response.data;
  } catch (error) {
    console.error('Error communicating with Python AI service:', error.message);
    // Return empty results instead of crashing, for robustness
    return { detections: [], violations: [] };
  }
};

module.exports = { analyzeFrame };
