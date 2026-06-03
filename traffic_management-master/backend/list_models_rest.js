require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("Available Models via API:");
      if (json.models) {
          json.models.forEach(m => console.log(m.name));
      } else {
          console.log("No models found. Response:", data);
      }
    } catch (e) {
      console.error("Failed to parse response:", e.message);
    }
  });
}).on('error', (err) => {
  console.error("Request Error:", err.message);
});
