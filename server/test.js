require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function run() {
  try {
    console.log("Key:", process.env.GEMINI_API_KEY ? "EXISTS" : "MISSING");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Hello!' }] }],
    });
    console.log("Success:", response.text);
  } catch (error) {
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    if (error.status) console.error("Error Status:", error.status);
    if (error.response) console.error("Error Response:", error.response);
  }
}
run();
