fetch("https://openrouter.ai/api/v1/models")
  .then(res => res.json())
  .then(data => {
    const freeModels = data.data.filter(m => m.id.endsWith(':free'));
    console.log("Free models:", freeModels.slice(0, 10).map(m => m.id));
  });
