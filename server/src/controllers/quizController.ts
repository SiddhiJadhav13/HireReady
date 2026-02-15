import { Request, Response } from 'express';
import Groq from 'groq-sdk';

type Difficulty = 'Low' | 'Medium' | 'High';

type Question = {
    type: 'mcq' | 'snippet';
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
};

function buildPrompt(role: string, difficulty: Difficulty) {
    const levelGuidance =
        difficulty === 'Low'
            ? 'Generate 10 MCQ questions ONLY (no code snippets) suitable for beginners. All questions must have type: "mcq".'
            : difficulty === 'Medium'
            ? 'Generate 10 mixed questions of intermediate complexity. Mix regular MCQs (type: "mcq") and code snippet MCQs (type: "snippet"). Include at least 4 code snippet questions.'
            : 'Generate 10 mixed questions with advanced difficulty. Mix regular MCQs (type: "mcq") and code snippet MCQs (type: "snippet"). Include at least 5 code snippet questions with complex problems.';

    return `You are an expert interviewer. Generate exactly 10 questions for the selected role and difficulty level.

${levelGuidance}

Role: ${role}
Difficulty: ${difficulty}

Rules:
- Each question must include: type ("mcq" or "snippet"), question text, 4 options, correctAnswer, and explanation.
- For "snippet" type questions, include code examples in the question text.
- Provide 4 multiple-choice options labeled A, B, C, D.
- correctAnswer must exactly match one of the options.
- explanation should provide clear reasoning for the correct answer.
- Return ONLY valid JSON array of exactly 10 objects with this exact shape:
  {
    "type": "mcq" or "snippet",
    "question": "...",
    "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
    "correctAnswer": "A) ...",
    "explanation": "..."
  }
- No markdown, no extra text, no code blocks - just the JSON array.
`;
}

function parseQuestions(text: string) {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');
    if (start === -1 || end === -1) return null;
    const jsonText = text.slice(start, end + 1);
    try {
        return JSON.parse(jsonText) as Question[];
    } catch {
        return null;
    }
}

export const generateQuestions = async (req: Request, res: Response) => {
    try {
        const groqApiKey = process.env.GROQ_API_KEY;
        if (!groqApiKey) {
            res.status(500).json({ message: 'Missing GROQ_API_KEY in server environment.' });
            return;
        }

        const groq = new Groq({ apiKey: groqApiKey });

        const { role, difficulty } = req.body as { role?: string; difficulty?: Difficulty };

        if (!role || !difficulty) {
            res.status(400).json({ message: 'role and difficulty are required.' });
            return;
        }

        const trimmedRole = role.trim();
        const trimmedDifficulty = difficulty.trim() as Difficulty;

        const prompt = buildPrompt(trimmedRole, trimmedDifficulty);

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            temperature: 0.9,
            messages: [
                { role: 'system', content: 'You return strict JSON only.' },
                { role: 'user', content: prompt },
            ],
        });

        const content = response.choices[0]?.message?.content ?? '';
        const questions = parseQuestions(content);

        if (!questions || questions.length !== 10) {
            res.status(500).json({ message: 'Failed to generate full test. Please retry.' });
            return;
        }

        res.status(200).json({ questions });
    } catch (error: any) {
        console.error('Generate quiz error:', error);
        res.status(500).json({ message: error?.message || 'Failed to generate quiz questions.' });
    }
};
