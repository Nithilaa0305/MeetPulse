import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
let apiKey = '';
env.split('\n').forEach(line => {
  if (line.startsWith('VITE_GEMINI_API_KEY=')) apiKey = line.split('=')[1].trim();
});

console.log("Using API Key (first 10 chars):", apiKey.slice(0, 10));

const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    contents: [{
      parts: [{ text: "Hello! Reply with a JSON object containing a 'status' field set to 'success'." }]
    }],
    generationConfig: {
      responseMimeType: "application/json"
    }
  })
}).then(res => {
  console.log("Status:", res.status, res.statusText);
  return res.text();
}).then(text => {
  console.log("Body:", text);
}).catch(console.error);
