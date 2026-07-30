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

export async function generateLectureSummary(courseName: string, transcriptText: string): Promise<string[]> {
  const apiKey = getOpenApiKeyOrOpenRouterKey();
  
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
  const model = isOpenRouter ? "google/gemma-2-9b-it:free" : "gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = window.location.href;
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
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate summary");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
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
    console.error("Failed to parse LLM response", e);
    return ["Failed to parse AI summary."];
  }
}

export async function generateStudyNotes(courseName: string, transcriptText: string): Promise<StudyNote[]> {
  const apiKey = getOpenPpiKeyOrOpenRouterKey();
  
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
  const model = isOpenRouter ? "google/gemma-2-9b-it:free" : "gpt-4o-mini";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  };
  if (isOpenRouter) {
    headers["HTTP-Referer"] = window.location.href;
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
    const error = await response.json();
    throw new Error(error.error?.message || "Failed to generate study notes");
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  try {
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
    console.error("Failed to parse LLM response", e);
    return [];
  }
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
