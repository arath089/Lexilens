import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  const { word } = req.query;

  if (!word) {
    return res.status(400).json({ error: "Missing word" });
  }

  try {
    const prompt = `Define the word "${word}". Also include synonyms, antonyms, a couple of usage examples, and an interesting fact if available. Respond in JSON format with keys: definition, synonyms, antonyms, examples, fact.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.choices[0].message.content;
    const usage = response.usage;

    const result = JSON.parse(content);

    res.status(200).json({
      ...result,
      usage,
    });
  } catch (err) {
    console.error("OpenAI Error:", err);
    res.status(500).json({ error: "Failed to fetch definition" });
  }
}
