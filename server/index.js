const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize Gemini
let ai;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

// Initialize Supabase
let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
}

// Authentication Middleware
const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = authHeader.split(' ')[1];

  if (!supabase) {
    return res.status(500).json({ error: 'Supabase not configured on server' });
  }

  // Securely verify token with Supabase
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  }

  // Attach user to request
  req.user = user;
  next();
};

// 1. Chat Completion Endpoint (Protected)
app.post('/api/chat', requireAuth, async (req, res) => {
  try {
    const { messages } = req.body;

    if (!ai) {
      return res.json({
        reply: "This is a mock response because the Gemini API key is missing.",
      });
    }

    const systemPrompt = `You are an analytical, step-by-step English teacher for beginners.
First, automatically detect the language the user is speaking to you in.
Your teaching style MUST follow these rules exactly:
- Instruction Language: You MUST explain concepts, provide translations, and give feedback in the SAME language the user used in their last message. If they speak in Hindi, respond in Hindi. If Tamil, respond in Tamil. If English, respond in English.
- Target Language: When providing English examples or correcting the student, provide the English phrase clearly.
- Simple Vocabulary: Keep your explanations simple and easy to understand.
- Step-by-step: Break ideas into small, easily digestible parts. Use structured lists.
- Direct and analytical: Identify and correct mistakes explicitly if needed.
- Formatting: Structure your response clearly using bullet points, numbered lists, and bold text for emphasis.

Always respond using this highly structured, analytical format. Address the user directly in their language.`;

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Retry up to 3 times for transient 503 errors
    let reply = null;
    let lastError = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: contents,
          config: { systemInstruction: systemPrompt }
        });
        reply = response.text;
        break; // success
      } catch (err) {
        lastError = err;
        const status = err?.status || err?.error?.code;
        if (status === 503 && attempt < 3) {
          console.warn(`Gemini 503 on attempt ${attempt}, retrying in ${attempt * 1500}ms…`);
          await new Promise(r => setTimeout(r, attempt * 1500));
        } else {
          throw err; // non-retryable or exhausted
        }
      }
    }

    res.json({ reply });
  } catch (error) {
    console.error("Chat API Error Detailed:", error);
    const status = error?.status || error?.error?.code;
    const msg = status === 503
      ? "The AI is busy right now. Please try again in a moment."
      : "Failed to generate chat response";
    res.status(500).json({ error: msg });
  }
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
