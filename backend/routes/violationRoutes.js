const express = require('express');
const router = express.Router();
const violationController = require('../controllers/violationController');

router.get('/', violationController.getAllViolations);
router.get('/video/:videoId', violationController.getViolationsByVideo);
router.get('/:id', violationController.getViolationById);
router.patch('/:id/status', violationController.updateViolationStatus);

module.exports = router;
