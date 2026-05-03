require('dotenv').config({ path: './server/.env' });
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
    console.error("Error:", error);
  }
}
run();
