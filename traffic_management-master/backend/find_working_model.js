require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const models = [
  "gemini-2.5-flash", 
  "gemini-1.5-flash",
  "gemini-pro",
  "gemini-1.0-pro"
];

async function findWorkingModel() {
  for (const name of models) {
    try {
      console.log(`Testing ${name}...`);
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent("Hello");
      const response = await result.response;
      console.log(`✅ ${name} WORKS:`, response.text().substring(0, 20));
      return name;
    } catch (err) {
      console.log(`❌ ${name} FAILED:`, err.message);
    }
  }
  return null;
}

findWorkingModel();
