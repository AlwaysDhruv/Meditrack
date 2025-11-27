const express = require("express")
const router = express.Router()
const { GoogleGenerativeAI } = require("@google/generative-ai")

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

router.post("/", async (req, res) => {
  try {
    const { message } = req.body

    if (!message) {
      return res.status(400).json({ reply: "No message provided." })
    }

    // STRICT CONTEXT LIMITATION
    const prompt = `
You are MediTrack's clinical communication assistant.

YOU MUST DO THESE STRICT RULES:

1. You ONLY respond about:
   - doctor communication
   - appointments
   - symptoms
   - vitals (BP, pulse, fever, etc.)
   - basic health guidance
   - medications/prescriptions
   - medical reports
   - patient-doctor messages

2. If the user asks anything unrelated (jokes, politics, math, stories, coding, movies, random topics):
   - YOU MUST REFUSE politely.
   - Say: "I can only help with health-related communication and doctor assistance."

3. DO NOT diagnose.
4. Keep responses short, medical, helpful, and professional.

User message:
"${message}"
`

    const result = await model.generateContent(prompt)
    const reply = result.response.text()

    res.json({ reply })

  } catch (err) {
    console.error(err)
    res.json({ reply: "AI system is unavailable. Try again later." })
  }
})

module.exports = router
