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

const getGeminiApiKey = () => {
  return (import.meta as any).env.VITE_GEMINI_API_KEY || "";
};

async function callGeminiAPI(prompt: string, jsonMode: boolean = false): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("Missing VITE_GEMINI_API_KEY");
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: jsonMode ? { responseMimeType: "application/json" } : undefined
    })
  });

  if (!response.ok) {
    if (response.status === 404) {
      try {
        const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const modelsData = await modelsRes.json();
        const available = modelsData.models?.map((m: any) => m.name.replace('models/', '')).filter((n: string) => n.includes('gemini')).join(', ');
        throw new Error(`Model not found. Available models on your API key: ${available}`);
      } catch (e) {
        // Fallback to default error if fetching models fails
      }
    }
    throw new Error(`Gemini API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Invalid response format from Gemini API");
  }
  return text;
}

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

function generateFallbackStudyNotes(courseName: string, transcriptText: string, errorMsg?: string): StudyNote[] {
  return [
    {
      title: "Core Concept Overview",
      desc: `A simulated study note generated as a fallback because the AI APIs failed. ${errorMsg ? 'Error details: ' + errorMsg : ''}`,
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

export function parseJsonContent(content: string) {
  let cleanJson = content.trim();
  if (cleanJson.startsWith("```json")) {
    cleanJson = cleanJson.substring(7);
  } else if (cleanJson.startsWith("```")) {
    cleanJson = cleanJson.substring(3);
  }
  if (cleanJson.endsWith("```")) {
    cleanJson = cleanJson.substring(0, cleanJson.length - 3);
  }
  return JSON.parse(cleanJson.trim());
}

export async function generateLectureSummary(courseName: string, transcriptText: string): Promise<string[]> {
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

  try {
    const apiKey = getOpenAIApiKey();
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
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = parseJsonContent(content);
    const paragraphs = parsed.paragraphs || parsed.summary || parsed;
    if (Array.isArray(paragraphs)) {
        return paragraphs;
    }
    return [content];
  } catch (e) {
    console.warn("Failed to generate OpenAI summary, trying Gemini fallback:", e);
    try {
      const content = await callGeminiAPI(prompt, true);
      const parsed = parseJsonContent(content);
      const paragraphs = parsed.paragraphs || parsed.summary || parsed;
      if (Array.isArray(paragraphs)) {
          return paragraphs;
      }
      return [content];
    } catch (geminiError) {
      console.error("Gemini summary fallback failed:", geminiError);
      return generateFallbackSummary(courseName, transcriptText);
    }
  }
}

export async function generateStudyNotes(courseName: string, transcriptText: string): Promise<StudyNote[]> {
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

  try {
    const apiKey = getOpenAIApiKey();
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
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = parseJsonContent(content);
    return parsed.notes || parsed || [];
  } catch (e) {
    console.warn("Failed to generate OpenAI study notes, trying Gemini fallback:", e);
    try {
      const content = await callGeminiAPI(prompt, true);
      const parsed = parseJsonContent(content);
      return parsed.notes || parsed || [];
    } catch (geminiError: any) {
      console.error("Gemini study notes fallback failed:", geminiError);
      return generateFallbackStudyNotes(courseName, transcriptText, geminiError.message || String(geminiError));
    }
  }
}

export async function generateQuizFromTranscript(courseName: string, transcriptText: string): Promise<any[]> {
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

  try {
    const apiKey = getOpenAIApiKey();
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
      throw new Error(`OpenAI API status ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = parseJsonContent(content);
    return parsed.questions || parsed || [];
  } catch (e) {
    console.warn("Failed to generate OpenAI quiz, trying Gemini fallback:", e);
    try {
      const content = await callGeminiAPI(prompt, true);
      const parsed = parseJsonContent(content);
      return parsed.questions || parsed || [];
    } catch (geminiError) {
      console.error("Gemini quiz fallback failed:", geminiError);
      return generateFallbackQuiz();
    }
  }
}



export async function askAIChatbot(
  question: string,
  transcriptText: string,
  subject: string,
  history: { role: "user" | "ai"; content: string }[],
  materialText?: string
): Promise<string> {
  const historyText = history
    .map(h => `${h.role === "user" ? "Student" : "AI"}: ${h.content}`)
    .join("\n");

  const prompt = `
    You are an intelligent Teaching Assistant for the course/subject: "${subject}".
    Your goal is to answer the student's question accurately and helpfully.
    
    IMPORTANT RULES:
    1. You must ONLY discuss topics related to the subject matter.
    2. If the student asks something off-topic (e.g., general knowledge, casual chat, programming help unrelated to the lecture), you MUST politely decline and say you can only answer questions related to the current lecture.
    3. Use the provided lecture transcript and presentation materials as your primary sources of truth. If the answer is in the transcript or materials, reference it.
    4. YOU HAVE FULL KNOWLEDGE OF THE PDF/PRESENTATION! The extracted text from the student's PDF/Slides is provided below under "Current Lecture Materials". If the student asks about "the pdf" or "the slides", they are referring to this text. NEVER tell the student you don't have access or can't view files. Read the text provided below and answer their question directly.
    5. Be concise and encouraging.

    Recent Lecture Transcript:
    """
    ${transcriptText.substring(Math.max(0, transcriptText.length - 8000))} // focus on the most recent part
    """

    ${materialText ? `
    Current Lecture Materials:
    """
    ${materialText.substring(0, 15000)} // focus on a reasonable chunk to prevent token limits
    """
    ` : `
    [SYSTEM NOTE: The lecture materials/PDF text is currently EMPTY or failed to load. If the student asks about the PDF, politely inform them that the PDF text was not successfully extracted or synced to your system yet.]
    `}

    Conversation History:
    """
    ${historyText}
    """

    Student's New Question: "${question}"

    AI Teaching Assistant Response:
  `;

  try {
    const response = await callGeminiAPI(prompt, false);
    return response.trim();
  } catch (error: any) {
    console.error("AI Chatbot API failed:", error);
    return "I'm sorry, I am currently unable to process your request. Please try again later.";
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
        const parsed = parseJsonContent(content);
        if (Array.isArray(parsed)) return parsed as LiveQuestion[];
        if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions as LiveQuestion[];
      } catch (e) {
        console.error("Failed to parse grouped questions", e);
      }
    } else {
      throw new Error(`OpenAI API status ${response.status}`);
    }
  } catch (error) {
    console.warn("Failed to group questions via OpenAI, trying Gemini fallback:", error);
    try {
      const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
      const content = await callGeminiAPI(combinedPrompt, true);
      const parsed = parseJsonContent(content);
      if (Array.isArray(parsed)) return parsed as LiveQuestion[];
      if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions as LiveQuestion[];
    } catch (geminiError) {
      console.error("Gemini grouping fallback failed:", geminiError);
    }
  }

  return questions; // fallback to original if failed
}
