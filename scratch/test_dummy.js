const apiKey = "sk-or-v1-dummykey123";
fetch("https://openrouter.ai/api/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: "google/gemma-2-9b-it:free",
    messages: [{ role: "user", content: "Hello" }]
  })
}).then(res => res.text()).then(console.log).catch(console.error);
