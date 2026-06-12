const fs = require('fs');
const path = require('path');

async function verify() {
  const videoPath = path.join(__dirname, 'testvideos', 'City of Pensacola Red Light Camera Violations.mp4');
  console.log('Reading video file from:', videoPath);
  if (!fs.existsSync(videoPath)) {
    throw new Error('Test video file not found at ' + videoPath);
  }
  const fileBuffer = fs.readFileSync(videoPath);
  const blob = new Blob([fileBuffer], { type: 'video/mp4' });
  
  const formData = new FormData();
  formData.append('file', blob, 'pensacola_violations.mp4');
  
  console.log('Uploading video to backend...');
  const uploadRes = await fetch('http://localhost:5000/api/videos/upload', {
    method: 'POST',
    body: formData
  });
  
  const uploadData = await uploadRes.json();
  console.log('Upload response:', uploadData);
  
  if (uploadData.status !== 'success') {
    throw new Error('Upload failed: ' + JSON.stringify(uploadData));
  }
  
  const videoId = uploadData.videoId;
  console.log(`Video uploaded successfully. Video ID: ${videoId}`);
  
  console.log('Triggering video processing...');
  const processRes = await fetch('http://localhost:5000/api/videos/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ videoId })
  });
  const processData = await processRes.json();
  console.log('Process trigger response:', processData);
  
  console.log('Polling video status...');
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    const statusRes = await fetch(`http://localhost:5000/api/videos/${videoId}`);
    const statusData = await statusRes.json();
    
    console.log(`Status: ${statusData.status} | Processed Frames: ${statusData.processedFrames} / ${statusData.totalFrames}`);
    
    if (statusData.status === 'completed') {
      console.log('Processing completed!');
      break;
    } else if (statusData.status === 'failed') {
      console.log('Processing failed!');
      break;
    }
  }
  
  console.log('Fetching violations...');
  const violationsRes = await fetch(`http://localhost:5000/api/violations/video/${videoId}`);
  const violations = await violationsRes.json();
  
  console.log(`\n--- Verification Results ---`);
  console.log(`Total Violations Found: ${violations.length}`);
  violations.forEach((v, index) => {
    console.log(`Violation ${index + 1}:`);
    console.log(`  - Vehicle ID: ${v.vehicleId}`);
    console.log(`  - Vehicle Type: ${v.vehicleType}`);
    console.log(`  - Violation Type: ${v.type}`);
    console.log(`  - Severity: ${v.severity}`);
    console.log(`  - Confidence: ${(v.confidence * 100).toFixed(1)}%`);
    console.log(`  - Number Plate: ${v.numberPlate}`);
    console.log(`  - Reason: ${v.explanation?.reason}`);
    console.log(`  - Suggested Action: ${v.explanation?.action}`);
  });
}

verify().catch(console.error);
