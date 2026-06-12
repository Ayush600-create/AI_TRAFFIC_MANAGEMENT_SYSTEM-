const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const isApiKeyValid = (key) => {
  if (!key) return false;
  const k = key.trim();
  if (k === "" || k === "undefined" || k === "null") return false;
  const lower = k.toLowerCase();
  if (lower.includes("your") || lower.includes("api_key") || lower.includes("placeholder")) return false;
  if (k.length < 10) return false;
  return true;
};

const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENAI_KEY;
let genAI = null;
if (isApiKeyValid(geminiKey)) {
  try {
    genAI = new GoogleGenerativeAI(geminiKey);
  } catch (err) {
    console.error("LLM Service: Failed to initialize GoogleGenerativeAI:", err.message);
  }
}

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
  if (isApiKeyValid(process.env.GROQ_API_KEY)) {
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
          timeout: 4000 // 4 seconds timeout
        });

        const content = response.data.choices[0].message.content;
        return JSON.parse(content);
      } catch (err) {
        if (err.response) {
          console.error(`LLM Service: Groq (${modelName}) failed.`, err.response.status, JSON.stringify(err.response.data));
          if (err.response.status === 401 || err.response.status === 400) {
            console.warn("LLM Service: Groq API key is unauthorized/invalid. Skipping other Groq models.");
            break; // Skip rest of Groq models if API key is invalid
          }
        } else {
          console.error(`LLM Service: Groq (${modelName}) failed.`, err.message);
        }
      }
    }
  } else {
    console.log("LLM Service: Groq API key not configured. Skipping Groq.");
  }

  // 2. Try Gemini (Fallback)
  if (genAI && isApiKeyValid(geminiKey)) {
    const geminiModels = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-pro"];
    for (const modelName of geminiModels) {
      try {
        console.log(`LLM Service: Attempting Gemini (${modelName}) as fallback...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        // Wrap the SDK promise with a 4s timeout
        const result = await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout fetching from Gemini API')), 4000))
        ]);
        
        const res = await result.response;
        const text = res.text();
        
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error(`LLM Service: Gemini (${modelName}) fallback failed.`, err.message);
        if (err.message.includes("API_KEY_INVALID") || err.message.includes("API key expired") || err.message.includes("API key")) {
          console.warn("LLM Service: Gemini API key is invalid/expired. Skipping other Gemini models.");
          break; // Skip rest of Gemini models if API key is invalid
        }
      }
    }
  } else {
    console.log("LLM Service: Gemini API key not configured. Skipping Gemini.");
  }

  // 3. Final static fallback
  console.log("LLM Service: All AI models failed/skipped. Using static fallback.");
  return {
    reason: `Automated detection of ${violationData.violation} by ${violationData.type}.`,
    rule: "Standard traffic safety regulation.",
    suggested_action: "Review footage and issue citation."
  };
};

module.exports = { explainViolation };
