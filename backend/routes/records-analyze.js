  const express = require("express");
  const router = express.Router();
  const { GoogleGenerativeAI } = require("@google/generative-ai");

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  router.post("/analyze", async (req, res) => {
    try {
      const { record } = req.body;

      if (!record) {
        return res.status(400).json({ analysis: "No record provided." });
      }

      const prompt = `
  Analyze this health record safely.
  Do not diagnose diseases.
  Give general safe advice.

  Record:
  ${JSON.stringify(record, null, 2)}
  `;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      res.json({ analysis: text });

    } catch (err) {
      console.error(err);
      res.status(500).json({ analysis: "AI analysis failed." });
    }
  });

  module.exports = router;
