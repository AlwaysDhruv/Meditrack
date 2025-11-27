  const express = require("express");
  const router = express.Router();
  const User = require("../models/User");

  // Get all doctors
  router.get("/", async (req, res) => {
    try {
      const doctors = await User.find({ role: "doctor" })
        .select("name email specialization");

      res.json({ doctors });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  });

  module.exports = router;
