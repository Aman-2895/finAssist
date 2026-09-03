// Thin wrapper around the Gemini API for the financial literacy chatbot.
// Requires GEMINI_API_KEY in .env — get one from https://aistudio.google.com/apikey
const axios = require('axios')

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

async function askGemini(message, { language = 'en', userContext = {} } = {}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return "Gemini isn't configured yet — add GEMINI_API_KEY to your .env to enable live answers."
  }

  const systemPrompt = `You are FinAssist's financial literacy assistant for Indian gig and informal workers.
Answer in ${language}. Keep answers short (3-5 sentences), plain-language, and specific to the user's context:
${JSON.stringify(userContext)}. Never claim to move real money or issue real insurance/loans — this app simulates those.`

  const { data } = await axios.post(
    `${GEMINI_URL}?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: `${systemPrompt}\n\nUser: ${message}` }] }],
    },
    { headers: { 'Content-Type': 'application/json' } }
  )

  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response."
}

module.exports = { askGemini }
