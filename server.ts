import express from 'express';
import type { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing with generous limit for pasted lecture notes and base64 documents
app.use(express.json({ limit: '20mb' }));

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const resolveModel = (requested?: string) =>
  requested && typeof requested === 'string' && requested.trim().length > 0
    ? requested.trim()
    : process.env.GEMINI_MODEL || 'gemini-3.8-flash';

// Health and key status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    hasGeminiKey: hasKey,
    model: resolveModel(),
    timestamp: new Date().toISOString(),
  });
});

// 1. Generate Academic Summary from text or notes
app.post('/api/gemini/summarize', async (req: Request, res: Response) => {
  try {
    const { title, courseName, content } = req.body;
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required for summarization.' });
    }

    const ai = getGeminiClient();
    const prompt = `You are Gradia's elite academic intelligence engine.
Analyze the following course material for "${title || 'Lecture Notes'}" in course "${courseName || 'General'}":

=== MATERIAL START ===
${content.slice(0, 45000)}
=== MATERIAL END ===

Generate an exhaustive, high-yield academic study summary in structured JSON format with the following keys:
1. overview: High-level executive synthesis (2-3 sentences explaining the core thesis and significance).
2. keyTakeaways: Array of 4-6 crucial core points every student must master for exams.
3. coreConcepts: Array of objects with "term" and "definition" explaining essential terminology and mechanisms.
4. formulasAndTheorems: Array of objects with "title", "formulaOrRule", and "application" (if no math formulas exist, include key principles or laws).
5. examTraps: Array of 3-4 common misconceptions, subtle mistakes, or typical test traps students fall into.
6. studyTip: One high-impact active recall study tip specific to this content.`;

    const response = await ai.models.generateContent({
      model: resolveModel(req.body.model),
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overview: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            coreConcepts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  term: { type: Type.STRING },
                  definition: { type: Type.STRING },
                },
                required: ['term', 'definition'],
              },
            },
            formulasAndTheorems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  formulaOrRule: { type: Type.STRING },
                  application: { type: Type.STRING },
                },
                required: ['title', 'formulaOrRule', 'application'],
              },
            },
            examTraps: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            studyTip: { type: Type.STRING },
          },
          required: ['overview', 'keyTakeaways', 'coreConcepts', 'formulasAndTheorems', 'examTraps', 'studyTip'],
        },
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Summarize Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate summary with Gemini.',
    });
  }
});

// 2. Generate Flashcards for Active Recall
app.post('/api/gemini/flashcards', async (req: Request, res: Response) => {
  try {
    const { content, count = 8, topic } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required to generate flashcards.' });
    }

    const ai = getGeminiClient();
    const prompt = `Generate exactly ${count} high-yield active recall flashcards from this academic content ${topic ? `focused on "${topic}"` : ''}:

=== MATERIAL START ===
${content.slice(0, 40000)}
=== MATERIAL END ===

Guidelines:
- Each card must test deep conceptual understanding, causal links, or precise application—not trivial trivia.
- Front: A clear, specific question or prompt (e.g. "Explain why Paxos requires 2F+1 nodes to tolerate F crash faults").
- Back: A crisp, authoritative answer (2-4 sentences) with the key takeaway highlighted.
- topic: The specific subtopic or concept tag (e.g. "Consensus", "Gradient Descent", "Glycolysis").
- difficulty: "Easy", "Medium", or "Hard".`;

    const response = await ai.models.generateContent({
      model: resolveModel(req.body.model),
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              front: { type: Type.STRING },
              back: { type: Type.STRING },
              topic: { type: Type.STRING },
              difficulty: { type: Type.STRING },
            },
            required: ['front', 'back', 'topic', 'difficulty'],
          },
        },
      },
    });

    const raw = response.text || '[]';
    const parsed = JSON.parse(raw);
    const flashcards = parsed.map((c: any, i: number) => ({
      ...c,
      id: c.id || `fc-${Date.now()}-${i}`,
      status: 'new', // new | learning | mastered
    }));
    res.json({ flashcards });
  } catch (error: any) {
    console.error('Gemini Flashcards Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate flashcards.',
    });
  }
});

// 3. Generate Scored Multiple Choice Quiz (MCQs)
app.post('/api/gemini/quiz', async (req: Request, res: Response) => {
  try {
    const { content, count = 5, difficulty = 'Mixed', topic } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content is required to generate a quiz.' });
    }

    const ai = getGeminiClient();
    const prompt = `Create a rigorous ${count}-question scored multiple choice quiz (MCQ) testing comprehension of this academic material ${topic ? `with focus on "${topic}"` : ''}.
Difficulty level: ${difficulty}.

=== MATERIAL START ===
${content.slice(0, 40000)}
=== MATERIAL END ===

Requirements:
- Each question must have exactly 4 plausible options [A, B, C, D].
- Exactly one correct option.
- correctIndex: 0, 1, 2, or 3 corresponding to options array index.
- explanation: A detailed, educational explanation of why the correct option is right and why common distractors are incorrect.
- topic: Subtopic tag to pinpoint specific knowledge gaps (e.g. "Two-Phase Commit", "Chain Rule", "ATP Synthase").`;

    const response = await ai.models.generateContent({
      model: resolveModel(req.body.model),
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              correctIndex: { type: Type.INTEGER },
              explanation: { type: Type.STRING },
              topic: { type: Type.STRING },
            },
            required: ['question', 'options', 'correctIndex', 'explanation', 'topic'],
          },
        },
      },
    });

    const raw = response.text || '[]';
    const parsed = JSON.parse(raw);
    const questions = parsed.map((q: any, i: number) => ({
      ...q,
      id: q.id || `q-${Date.now()}-${i}`,
      options: Array.isArray(q.options) && q.options.length === 4 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'],
      correctIndex: typeof q.correctIndex === 'number' ? Math.max(0, Math.min(3, q.correctIndex)) : 0,
    }));

    res.json({ questions });
  } catch (error: any) {
    console.error('Gemini Quiz Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate quiz.',
    });
  }
});

// 4. Generate Adaptive Revision Plan from Weak Quiz Topics
app.post('/api/gemini/revision-plan', async (req: Request, res: Response) => {
  try {
    const { weakTopics, courses, daysAvailable = 7, dailyHours = 3 } = req.body;

    const ai = getGeminiClient();
    const prompt = `You are an expert cognitive academic advisor. A university student needs an optimal, adaptive revision schedule.
Here is their profile:
- Identified Weak Subtopics from Quizzes: ${JSON.stringify(weakTopics || [])}
- Active Courses & Current Grades: ${JSON.stringify(courses || [])}
- Target Schedule: ${daysAvailable} days available before key assessments, with ${dailyHours} hours/day study capacity.

Design an adaptive, high-impact revision plan prioritized by:
1. Courses where current grade is lowest or high-credit courses with upcoming exams.
2. Directly addressing the student's identified weak subtopics using active recall, spaced intervals, and deliberate practice.

Output JSON with:
1. strategyOverview: 2-3 sentences explaining the cognitive pacing strategy.
2. dailySchedules: Array of objects for each day:
   - dayNumber: e.g. 1, 2, ...
   - dayTitle: e.g. "Foundations & High-Yield Weaknesses"
   - totalHours: number (e.g. 3)
   - sessions: Array of study blocks with:
     - courseCode: e.g. "CS301"
     - topic: e.g. "Two-Phase Commit & Quorum Consensus"
     - durationMinutes: e.g. 45
     - technique: "Active Recall" | "Feynman Explanation" | "Practice Problems" | "Flashcard Drill"
     - specificGoal: Concrete actionable deliverable (e.g. "Derive quorum equation and write consensus state machine from memory")
3. highYieldChecklist: Array of 4-6 specific must-do checkpoints to ensure grade turnaround.`;

    const response = await ai.models.generateContent({
      model: resolveModel(req.body.model),
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            strategyOverview: { type: Type.STRING },
            dailySchedules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  dayNumber: { type: Type.INTEGER },
                  dayTitle: { type: Type.STRING },
                  totalHours: { type: Type.NUMBER },
                  sessions: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        courseCode: { type: Type.STRING },
                        topic: { type: Type.STRING },
                        durationMinutes: { type: Type.INTEGER },
                        technique: { type: Type.STRING },
                        specificGoal: { type: Type.STRING },
                      },
                      required: ['courseCode', 'topic', 'durationMinutes', 'technique', 'specificGoal'],
                    },
                  },
                },
                required: ['dayNumber', 'dayTitle', 'totalHours', 'sessions'],
              },
            },
            highYieldChecklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['strategyOverview', 'dailySchedules', 'highYieldChecklist'],
        },
      },
    });

    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemini Revision Plan Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate adaptive revision plan.',
    });
  }
});

// 5. Interactive Socratic AI Academic Tutor
app.post('/api/gemini/tutor', async (req: Request, res: Response) => {
  try {
    const { courseName, topic, query, conversationHistory = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required for tutor.' });
    }

    const ai = getGeminiClient();
    
    // Construct prompt with history context
    const historyText = conversationHistory
      .slice(-6)
      .map((m: any) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
      .join('\n');

    const prompt = `You are Gradia's Socratic Academic Tutor for course "${courseName || 'General Academic'}" regarding topic "${topic || 'Course Material'}".
Your goal is to guide the student toward deep conceptual clarity and exam-level mastery.
- Do not just dump dry textbook text; provide intuitive mental models, concrete examples, or brief derivations.
- Point out edge cases or subtle test traps.
- Keep the tone encouraging, intellectual, and focused on student mastery.

Previous conversation:
${historyText || 'None'}

Student: ${query}
Tutor:`;

    const response = await ai.models.generateContent({
      model: resolveModel(req.body.model),
      contents: prompt,
    });

    res.json({
      reply: response.text || 'I understand your question. Let us examine this from first principles.',
    });
  } catch (error: any) {
    console.error('Gemini Tutor Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to get tutor response.',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Gradia Academic OS running on port ${PORT} (dev mode: ${isDev})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
