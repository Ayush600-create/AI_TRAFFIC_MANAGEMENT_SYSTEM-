require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModel() {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest", // ✅ fixed
    });

    const result = await model.generateContent("Hello");
    const response = await result.response;

    console.log("Working ✅");
    console.log(response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

testModel();