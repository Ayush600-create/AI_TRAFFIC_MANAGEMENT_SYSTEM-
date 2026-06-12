const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Use system-wide ffmpeg/ffprobe on Docker/Render. Fall back to installers in local development.
if (process.env.NODE_ENV !== 'production') {
  try {
    const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
    const ffprobePath = require('@ffprobe-installer/ffprobe').path;
    ffmpeg.setFfmpegPath(ffmpegPath);
    ffmpeg.setFfprobePath(ffprobePath);
    console.log('[ffmpeg] Local mode: Using installer-bundled binaries');
  } catch (e) {
    console.log('[ffmpeg] Local installers not found, using system PATH');
  }
} else {
  console.log('[ffmpeg] Production mode: Using system-wide ffmpeg and ffprobe');
}

/**
 * Returns video metadata (duration, fps, resolution) via ffprobe.
 * @param {string} videoPath
 * @returns {Promise<{duration: number, fps: number, width: number, height: number}>}
 */
const getVideoMetadata = (videoPath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      const stream = metadata.streams.find(s => s.codec_type === 'video') || {};
      const fps = eval(stream.r_frame_rate || '25/1');  // e.g. "30000/1001" → 29.97
      resolve({
        duration: metadata.format.duration || 0,
        fps: fps,
        width: stream.width || 1920,
        height: stream.height || 1080
      });
    });
  });
};

/**
 * Extracts frames from a video at 1 frame per second (configurable via sampleFps).
 * Each returned frame object carries a real timestamp in seconds derived from its
 * position in the video — this feeds accurate timestamps into violation records.
 *
 * @param {string} videoPath   - Absolute path to the input video.
 * @param {string} outputDir   - Directory to write extracted frame JPEGs.
 * @param {number} [sampleFps=1] - How many frames per second to extract.
 * @returns {Promise<Array<{id, path, timestamp}>>}
 */
const extractFrames = async (videoPath, outputDir, sampleFps = 1) => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Get real video metadata so timestamps are accurate
  let meta = { duration: 0, fps: 25, width: 1920, height: 1080 };
  try {
    meta = await getVideoMetadata(videoPath);
  } catch (e) {
    console.warn('[ffmpeg] Could not read metadata, using defaults:', e.message);
  }

  const duration = meta.duration;
  console.log(
    `[ffmpeg] Extracting frames from "${path.basename(videoPath)}" ` +
    `(${duration.toFixed(1)}s @ ${meta.fps.toFixed(2)} fps) → 1 frame/${sampleFps}s`
  );

  return new Promise((resolve, reject) => {
    const frames = [];

    // Use vf fps filter for precise time-based sampling
    ffmpeg(videoPath)
      .outputOptions([
        `-vf fps=${sampleFps}`,   // e.g. 1 frame per second
        '-q:v 2'                  // high quality JPEG
      ])
      .output(path.join(outputDir, 'frame_%05d.jpg'))
      .on('end', () => {
        // Build frame list from disk — this gives us the actual files written
        const files = fs.readdirSync(outputDir)
          .filter(f => f.startsWith('frame_') && f.endsWith('.jpg'))
          .sort();

        files.forEach((filename, index) => {
          // Compute real timestamp: each frame is 1/sampleFps seconds apart
          const timestampSec = index / sampleFps;
          frames.push({
            id: index + 1,
            path: path.join(outputDir, filename),
            timestamp: parseFloat(timestampSec.toFixed(3))
          });
        });

        console.log(`[ffmpeg] ✓ Extracted ${frames.length} frames.`);
        resolve(frames);
      })
      .on('error', (err) => {
        console.error('[ffmpeg] Frame extraction error:', err.message);
        reject(err);
      })
      .run();
  });
};

module.exports = { extractFrames, getVideoMetadata };
