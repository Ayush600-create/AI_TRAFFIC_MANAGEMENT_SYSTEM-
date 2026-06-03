const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Uses Groq (primary) or Gemini (fallback) to explain a traffic violation.
 * @param {Object} violationData - Data from the YOLO detection and tracking.
 * @returns {Promise<Object>} - Structured explanation.
 */
const explainViolation = async (violationData) => {
  const prompt = `
    Analyze this traffic violation detection data and provide a concise explanation for a legal report.
    
    DETECTION DATA:
    - Vehicle Type: ${violationData.type}
    - Violation Type: ${violationData.violation}
    - Severity: ${violationData.severity}
    - Confidence: ${violationData.confidence.toFixed(2)}%
    
    INSTRUCTIONS:
    - Generate a "reason" (max 15 words) describing what happened.
    - Generate a "rule" (max 10 words) referring to standard traffic laws.
    - Generate a "suggested_action" (e.g., 'Issue fine', 'Warning').
    
    JSON FORMAT:
    {
      "reason": "...",
      "rule": "...",
      "suggested_action": "..."
    }
  `;

  // 1. Try Groq Models
  const groqModels = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"];
  for (const modelName of groqModels) {
    try {
      console.log(`LLM Service: Attempting Groq (${modelName})...`);
      const response = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: modelName,
        messages: [
          { role: "system", content: "You are a professional traffic law analyst. Always respond in valid JSON." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      }, {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      });

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (err) {
      if (err.response) {
        console.error(`LLM Service: Groq (${modelName}) failed.`, err.response.status, JSON.stringify(err.response.data));
      } else {
        console.error(`LLM Service: Groq (${modelName}) failed.`, err.message);
      }
    }
  }

  // 2. Try Gemini (Fallback)
  const geminiModels = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
  for (const modelName of geminiModels) {
    try {
      console.log(`LLM Service: Attempting Gemini (${modelName}) as fallback...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const res = await result.response;
      const text = res.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (err) {
      console.error(`LLM Service: Gemini (${modelName}) fallback failed.`, err.message);
    }
  }

  // 3. Final static fallback
  console.log("LLM Service: All AI models failed. Using static fallback.");
  return {
    reason: `Automated detection of ${violationData.violation} by ${violationData.type}.`,
    rule: "Standard traffic safety regulation.",
    suggested_action: "Review footage and issue citation."
  };
};

module.exports = { explainViolation };
