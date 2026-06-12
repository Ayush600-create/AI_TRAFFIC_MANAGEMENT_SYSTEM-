const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const videoController = require('../controllers/videoController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext);
    // Sanitize name and limit length to 30 characters to prevent Windows MAX_PATH (260 char) errors
    const sanitized = baseName.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    cb(null, `${Date.now()}-${sanitized}${ext}`);
  }
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), videoController.uploadVideo);
router.post('/process', videoController.processVideo);
router.get('/telemetry', videoController.getLatestTelemetry);
router.get('/violations/:id', videoController.getViolationById);
router.get('/:videoId', videoController.getVideoStatus);
router.post('/reset', videoController.resetAllData);
router.get('/', videoController.getVideos);

module.exports = router;
