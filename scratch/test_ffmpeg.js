const { extractFrames } = require('../backend/services/ffmpegService');
const path = require('path');

const videoPath = 'C:\\Users\\ayush\\Desktop\\traffic_management-master\\backend\\uploads\\1781298562995-Fixed CCTV traffic surveillance camera mounted high above a busy urban road intersection during daytime with wide-angle view. Multiple vehicles including cars, motorcycles, buses, trucks, bicycles, and pedestrians mo.mp4';
const outputDir = path.join(__dirname, 'temp_frames');

console.log('Testing frame extraction...');
extractFrames(videoPath, outputDir, 2)
  .then(frames => {
    console.log('Success! Extracted frames count:', frames.length);
  })
  .catch(err => {
    console.error('Extraction failed with error:', err);
  });
