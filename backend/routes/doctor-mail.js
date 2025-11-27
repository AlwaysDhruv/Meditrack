const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");

// Doctor → Patient Email Sender
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Doctor sends mail to a patient
router.post("/send", auth, async (req, res) => {
  try {
    const { patientId, subject, message } = req.body;

    if (!patientId || !subject || !message) {
      return res.status(400).json({ message: "All fields required." });
    }

    // Find patient
    const patient = await User.findById(patientId);
    if (!patient || patient.role !== "patient") {
      return res.status(404).json({ message: "Patient not found." });
    }

    // Find doctor sending
    const doctor = await User.findById(req.user._id);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: patient.email,
      subject: `Message from Dr. ${doctor.name}: ${subject}`,
      html: `
        <h2>Message From Your Doctor</h2>

        <p><strong>Doctor Name:</strong> Dr. ${doctor.name}</p>
        <p><strong>Doctor Email:</strong> ${doctor.email}</p>

        <h3>Message:</h3>
        <p>${message}</p>

        <hr/>
        <small>MediTrack Health System</small>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Mail sent successfully!" });

  } catch (err) {
    console.error("MAIL ERROR:", err);
    res.status(500).json({ message: "Mail sending failed." });
  }
});

module.exports = router;
