import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import Groq from "groq-sdk";
import { SYSTEM_PROMPT } from "./context.js";

const app = express();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY?.trim() });

// Only allow your actual frontend to call this API once deployed.
// During local dev, leave FRONTEND_ORIGIN unset to allow any origin.
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "*" }));
app.use(express.json());

// Protects your free Groq quota from abuse — 30 messages per hour per visitor.
const chatLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many messages right now — please try again later, or email Abdur directly.",
  },
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  const { messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  // Cap conversation history sent to the model — controls token usage per request.
  const recentHistory = messages.slice(-10);

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...recentHistory],
      temperature: 0.4,
      max_tokens: 300,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error("Groq API error:", err);
    res.status(500).json({
      error: "Something went wrong on my end — please try again in a moment.",
    });
  }
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Chatbot backend running on http://localhost:${PORT}`);
});