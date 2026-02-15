import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import express from "express";
import Groq from "groq-sdk";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const app = express();
const port = Number(process.env.PORT) || 5174;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error("Missing GROQ_API_KEY in environment");
}

const groq = new Groq({ apiKey: groqApiKey });

type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

type GroqRequestBody = {
  role?: string;
  difficulty?: string;
  excludeQuestions?: string[];
};

function buildPrompt(role: string, difficulty: string, excludeQuestions: string[]) {
  const exclusions = excludeQuestions.length
    ? `Avoid repeating these questions or close paraphrases: ${excludeQuestions.join(" | ")}.`
    : "Avoid repeating any questions in the same session.";

  return `You are an expert interviewer. Generate exactly 10 unique interview questions for the role: ${role}. Difficulty: ${difficulty}.
Rules:
- Low: conceptual MCQs only.
- Medium: MCQs + short code snippet questions.
- High: advanced MCQs + debugging + output-based code questions.
- Include code blocks in the question text when needed using triple backticks.
- Provide 4 multiple-choice options for every question.
- Ensure no repeated questions within the list.
- ${exclusions}
Return ONLY valid JSON array with objects in this shape:
[{"question":"...","options":["A","B","C","D"],"correctAnswer":"...","explanation":"..."}]
`;
}

function extractJson(text: string) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return null;
  const jsonText = text.slice(start, end + 1);
  try {
    return JSON.parse(jsonText) as Question[];
  } catch {
    return null;
  }
}

function ensureUnique(questions: Question[]) {
  const seen = new Set<string>();
  return questions.filter((q) => {
    const key = q.question.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

app.post("/api/groq", async (req, res) => {
  const body = req.body as GroqRequestBody;
  const role = body.role?.trim();
  const difficulty = body.difficulty?.trim();
  const excludeQuestions = body.excludeQuestions ?? [];

  if (!role || !difficulty) {
    return res.status(400).send("Missing role or difficulty");
  }

  const prompt = buildPrompt(role, difficulty, excludeQuestions);

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      messages: [
        { role: "system", content: "You return strict JSON only." },
        { role: "user", content: prompt }
      ]
    });

    const content = response.choices[0]?.message?.content ?? "";
    const parsed = extractJson(content);
    if (!parsed) {
      return res.status(500).send("Failed to parse GROQ response");
    }

    const uniqueQuestions = ensureUnique(parsed).slice(0, 10);

    if (uniqueQuestions.length < 10) {
      return res.status(500).send("Insufficient unique questions returned");
    }

    return res.json({ questions: uniqueQuestions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).send(message);
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
