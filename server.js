import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: ["http://localhost:5173", "http://localhost:5174"] }));

const PORT = 5000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY not set in .env!");
  process.exit(1);
}

// Initialize Gemini client
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Function to call Gemini
async function callGemini(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", // Replace with the appropriate model ID
      contents: prompt,
    });

    return response.text;
  } catch (err) {
    console.error("Error calling Gemini:", err);
    return "";
  }
}

// Generate questions
app.post("/api/generateQuestions", async (req, res) => {

  const prompt = `
You are an AI interview assistant.
Generate 6 technical questions  for full stack (React/Node) role (2 Easy → 2 Medium → 2 Hard).
Timers per question: Easy 20s, Medium 60s, Hard 120s.
ONLY RETURN A JSON ARRAY OF OBJECTS. DO NOT ADD ANY TEXT OUTSIDE JSON.

Example format:
[
  { "q": "Question text", "difficulty": "easy", "time": 20 },
  { "q": "Question text", "difficulty": "easy", "time": 20 },
  { "q": "Question text", "difficulty": "medium", "time": 60 },
  { "q": "Question text", "difficulty": "medium", "time": 60 },
  { "q": "Question text", "difficulty": "hard", "time": 120 },
  { "q": "Question text", "difficulty": "hard", "time": 120 }
]


`;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    let text = result.text;

    // clean JSON (strip ```json … ``` if present)
    const cleaned = text.replace(/```json|```/g, "").trim();

    let questions = JSON.parse(cleaned).map((q) => ({
      ...q,
      time: Number(q.time) || 0, // force numeric
    }));

    res.json({ questions });
  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({
      questions: [
        {
          q: "Explain event delegation in JavaScript.",
          difficulty: "easy",
          time: 20,
        },
        { q: "What are React hooks?", difficulty: "easy", time: 20 },
        {
          q: "How does Node.js handle asynchronous operations?",
          difficulty: "medium",
          time: 60,
        },
        { q: "Explain middleware in Express.", difficulty: "medium", time: 60 },
        {
          q: "Design a scalable folder structure for a MERN project.",
          difficulty: "hard",
          time: 120,
        },
        {
          q: "How would you optimize a React app for performance?",
          difficulty: "hard",
          time: 120,
        },
      ],
    });
  }
});

// Evaluate answer
// Evaluate answer
app.post("/api/evaluateAnswer", async (req, res) => {
  try {
    const { question, answer, resumeContext } = req.body;

    const prompt = `
You are an interview evaluator for a Full Stack (React/Node.js) role.
Grade the candidate's answer STRICTLY out of 10.

Criteria:
- Technical correctness
- Depth of explanation
- Relevance to the question
- Clarity and completeness

Return ONLY valid JSON in this format:
{
  "score": number (0-10),
  "feedback": "short constructive feedback (1-2 sentences)"
}

Question: "${question}"
Answer: "${answer || "No Answer"}"
Candidate Resume Context: ${resumeContext}
`;

    const aiResponse = await callGemini(prompt);
    let cleaned = aiResponse.trim().replace(/```json|```/g, "");

    let result;
    try {
      result = JSON.parse(cleaned);

      // Enforce bounds
      if (
        typeof result.score !== "number" ||
        result.score < 0 ||
        result.score > 10
      ) {
        result.score = 0;
      }
      if (!result.feedback) {
        result.feedback = "No feedback generated.";
      }
    } catch (err) {
      console.warn("Gemini parse error, fallback used:", aiResponse);
      result = {
        score: 0,
        feedback:
          "Answer could not be evaluated. Likely incomplete or irrelevant.",
      };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to evaluate answer" });
  }
});
// Generate final summary for candidate after interview
app.post("/api/finalSummary", async (req, res) => {
  try {
    const { answers, resumeContext } = req.body;

    // Construct the AI prompt
    const prompt = `
    You are an AI interview evaluator.

    The candidate answered the following questions:
    ${answers
        .map(
          (a, i) =>
            `${i + 1}. Q: ${a.question} A: ${a.answer} Score: ${a.score} Feedback: ${a.feedback}`
        )
        .join("\n")}

    Provide a concise 3-4 line professional summary of the candidate's performance, strengths, weaknesses, and overall readiness for a full stack role.
    Return only JSON like: { "summary": "..." }
    `;

    // Call Gemini API to get the summary
    const aiResponse = await callGemini(prompt);

    if (!aiResponse) {
      throw new Error("Failed to generate AI summary");
    }

    let result;
    try {
      // Clean the response if needed
      let cleaned = aiResponse.trim();
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/```json|```/g, "").trim();
      }

      result = { summary: cleaned };
    } catch (error) {
      console.error("Error cleaning AI response:", error);
      result = { summary: "Candidate completed the interview. Performance details available in individual feedbacks." };
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate final summary" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
