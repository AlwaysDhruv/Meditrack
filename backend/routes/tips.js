const express = require("express")
const router = express.Router()
const { GoogleGenerativeAI } = require("@google/generative-ai")

// Gemini init
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

router.post("/", async (req, res) => {
  try {
    const { symptoms } = req.body

    if (!symptoms || symptoms.trim() === "") {
      return res.status(400).json({ tip: "Please describe your symptoms." })
    }

    const prompt = `
The user will describe symptoms. 
You are a friendly medical assistant. 
You give SAFE, GENERAL HEALTH TIPS ONLY.
You MUST NOT diagnose diseases.

User symptoms: ${symptoms}

Your response must follow this structure:
1. What the symptoms generally indicate
2. Simple home-care suggestions
3. When to see a doctor
4. Safety warning
`

    const result = await model.generateContent(prompt)
    const aiText = result.response.text()

    res.json({ tip: aiText })

  } catch (err) {
    console.error("Gemini Error:", err)
    res.json({ tip: "I’m facing some issues generating advice. Please try again." })
  }
})

module.exports = router
