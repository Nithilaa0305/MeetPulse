export interface StudyNote {
  title: string;
  desc: string;
  bullets?: string[];
  example?: string;
}

const getOpenAIApiKey = () => {
  const key = (import.meta as any).env.VITE_OPENAI_API_KEY || (import.meta as any).env.VITE_OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("Missing API Key. Please add VITE_OPENAI_API_KEY to your .env file.");
  }
  return key;
};

const KEYWORDS = [
  "backpropagation", "neural networks", "activation", "sigmoid", "relu", 
  "gradient descent", "calculus", "chain rule", "loss", "deep learning", 
  "forward propagation", "weights", "derivatives"
];

function generateFallbackSummary(courseName: string, transcriptText: string): string[] {
  return [
    `[Simulated Summary] This lecture on "${courseName}" covered the foundational principles of the subject matter. Note: The AI API key in your .env file is currently invalid or returned 'User not found', so this offline backup was generated instead.`,
    `During the session, the presenter walked through concepts relating to: ${KEYWORDS.slice(0, 7).join(", ")}. The material focused on establishing mathematical intuitions and logical frameworks.`,
    `Students actively tracked the presentation slides, participated in polls, and logged their understanding indicators. Key slides saw higher engagement as complex derivations were explained.`,
    `Here is a preview of the live session transcript recorded: "${transcriptText.substring(0, 300)}..."`
  ];
}

function generateFallbackStudyNotes(courseName: string, transcriptText: string): StudyNote[] {
  return [
    {
      title: "Core Concept Overview",
      desc: `A simulated study note generated as a fallback because the OpenRouter/OpenAI API key is invalid or offline.`,
      bullets: [
        "Review the key definitions and formulas in the lecture slides.",
        "Ensure you understand the step-by-step mathematical derivations.",
        "Practice applying these concepts to new problems before the examination."
      ],
      example: "Consult the session transcript preview: '" + transcriptText.substring(0, 100) + "...'"
    },
    {
      title: "Primary Academic Terms",
      desc: "Key subject matter terms extracted from this course's syllabus and presentation structure.",
      bullets: KEYWORDS.slice(0, 6).map(k => `Deep dive into the definition and application of ${k}.`),
      example: "Make sure you can sketch diagrams or flowcharts explaining how these terms relate."
    }
  ];
}

export async function generateLectureSummary(courseName: string, transcriptText: string): Promise<string[]> {
  try {
    const apiKey = getOpenAIApiKey();
    const prompt = `
    You are an expert academic assistant. The user will provide a live transcript of a lecture for the course "${courseName}".
    Your job is to generate a cohesive, textbook-style summary of the lecture.
    Ignore all speech disfluencies (ums, ahs, repetitions).
    Return the summary as a JSON array of strings, where each string is a well-formed paragraph. Do not return markdown, just raw text in the array.
    Strictly output a valid JSON array of strings, nothing else. For example: ["Paragraph 1", "Paragraph 2"]

Transcript:
"""
${transcriptText}
"""
`;

    const isOpenRouter = apiKey.startsWith("sk-or-v1-");
    const url = isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isOpenRouter ? "google/gemma-4-31b-it:free" : "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = window.location.origin || "https://meetpulse.live";
      headers["X-Title"] = "MeetPulse";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.warn("API response error, falling back to simulated summary.");
      return generateFallbackSummary(courseName, transcriptText);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Clean up JSON codeblock formatting if the model wraps it
    let cleanJson = content.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    const paragraphs = parsed.paragraphs || parsed.summary || parsed;
    if (Array.isArray(paragraphs)) {
        return paragraphs;
    }
    return [content]; // fallback
  } catch (e) {
    console.error("Failed to generate AI summary, using fallback:", e);
    return generateFallbackSummary(courseName, transcriptText);
  }
}

export async function generateStudyNotes(courseName: string, transcriptText: string): Promise<StudyNote[]> {
  try {
    const apiKey = getOpenAIApiKey();
    const prompt = `
    You are an expert academic assistant. The user will provide a live transcript of a lecture for the course "${courseName}".
    Your job is to extract the core concepts and create a comprehensive study guide for the students.
    Include formal definitions, life cycles, and concrete examples, even if the professor did not explicitly discuss them in the lecture, to help the students prepare for exams.
    
    You MUST return a JSON object with a single key "notes" containing an array of objects. Each object must have the following structure:
    {
      "title": "Concept Name",
  "desc": "A comprehensive description or formal definition.",
  "bullets": ["Important point 1", "Important point 2"], // optional array of strings
  "example": "A concrete example to help understand the concept." // optional string
}
Strictly output valid JSON, nothing else. No markdown wrappers.

Transcript:
"""
${transcriptText}
"""
`;

    const isOpenRouter = apiKey.startsWith("sk-or-v1-");
    const url = isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isOpenRouter ? "google/gemma-4-31b-it:free" : "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = window.location.origin || "https://meetpulse.live";
      headers["X-Title"] = "MeetPulse";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.warn("API response error, falling back to simulated study notes.");
      return generateFallbackStudyNotes(courseName, transcriptText);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let cleanJson = content.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("```")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    return parsed.notes || parsed || [];
  } catch (e) {
    console.error("Failed to generate AI study notes, using fallback:", e);
    return generateFallbackStudyNotes(courseName, transcriptText);
  }
}

export async function generateQuizFromTranscript(courseName: string, transcriptText: string): Promise<any[]> {
  try {
    const apiKey = getOpenAIApiKey();
    const prompt = `
    You are an expert academic assistant. The user will provide a live transcript of a lecture for the course "${courseName}".
    Your job is to generate 3-5 multiple choice questions based on the lecture material to test the students' understanding.
    
    You MUST return a JSON object with a single key "questions" containing an array of objects. Each object must have:
    {
      "id": "q1",
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0 // The zero-based index of the correct option
    }
    Strictly output valid JSON, nothing else. No markdown wrappers.

    Transcript:
    """
    ${transcriptText}
    """
    `;

    const isOpenRouter = apiKey.startsWith("sk-or-v1-");
    const url = isOpenRouter ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = isOpenRouter ? "google/gemma-4-31b-it:free" : "gpt-4o-mini";
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    };
    if (isOpenRouter) {
      headers["HTTP-Referer"] = window.location.origin || "https://meetpulse.live";
      headers["X-Title"] = "MeetPulse";
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      console.warn("API response error, falling back to simulated quiz.");
      return generateFallbackQuiz();
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    let cleanJson = content.trim();
    if (cleanJson.startsWith("\`\`\`json")) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith("\`\`\`")) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith("\`\`\`")) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    const parsed = JSON.parse(cleanJson);
    return parsed.questions || parsed || [];
  } catch (e) {
    console.error("Failed to generate AI quiz, using fallback:", e);
    return generateFallbackQuiz();
  }
}

function generateFallbackQuiz(): any[] {
  return [
    {
      id: "q1",
      question: "What is the primary purpose of backpropagation in neural networks?",
      options: [
        "To randomly initialize weights",
        "To compute gradients and update weights",
        "To increase the number of layers",
        "To apply the activation function"
      ],
      correctAnswer: 1
    },
    {
      id: "q2",
      question: "Which activation function is most commonly used in hidden layers today?",
      options: ["Sigmoid", "Tanh", "ReLU", "Step"],
      correctAnswer: 2
    },
    {
      id: "q3",
      question: "What optimization algorithm was discussed for minimizing loss?",
      options: ["Gradient Descent", "Random Search", "Bubble Sort", "Linear Programming"],
      correctAnswer: 0
    }
  ];
}

// Helpers to match internal key function name
function getOpenApiKeyOrOpenRouterKey() {
  return getOpenApiKey();
}
function getOpenPpiKeyOrOpenRouterKey() {
  return getOpenApiKey();
}
function getOpenApiKey() {
  return getOpenAIApiKey();
}

import { LiveQuestion } from "../types";

export async function groupSimilarQuestions(questions: LiveQuestion[]): Promise<LiveQuestion[]> {
  if (questions.length < 2) return questions;
  
  const systemPrompt = `You are an AI teaching assistant. The students have asked several questions. Group similar questions together to save the lecturer's time. 
Return a JSON array of objects, where each object has:
- "text": The summarized grouped question.
- "count": The number of questions that were grouped into this one.
- "isAnswered": false
- "author": A comma separated list of original authors.
- "id": A unique string id (e.g. 'grouped-xyz').
- "isAnonymous": false
- "upvotes": 0
Your response must be valid JSON matching this schema exactly.`;

  const userPrompt = `Current questions:\n${JSON.stringify(questions, null, 2)}`;

  try {
    const key = getOpenAIApiKey();
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "HTTP-Referer": "https://meetpulse.live",
        "X-Title": "MeetPulse",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it:free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content;
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) return parsed as LiveQuestion[];
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions as LiveQuestion[];
      } catch (e) {
        console.error("Failed to parse grouped questions", e);
      }
    } else {
      console.error("Failed to group questions", await response.text());
    }
  } catch (error) {
    console.error("Error during question grouping:", error);
  }

  return questions; // fallback to original if failed
}
