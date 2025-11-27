const express = require("express");
const router = express.Router();
const User = require("../models/User");
const nodemailer = require("nodemailer");
const auth = require("../middleware/auth");

// MAIL SENDER CONFIG (use your email + app password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,       // your gmail
    pass: process.env.SMTP_PASS        // app password
  }
});

// Send mail to doctor
router.post("/send", auth, async (req, res) => {
  try {
    const { doctorId, subject, message } = req.body;

    if (!doctorId || !subject || !message) {
      return res.status(400).json({ message: "Missing fields." });
    }

    // find doctor
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor") {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // find sending patient
    const patient = await User.findById(req.user.id);

    const mailOptions = {
      from: process.env.MAIL_USER,
      to: doctor.email,
      subject: `Message from ${patient.name}: ${subject}`,
      html: `
        <h2>New Message From Patient</h2>
        <p><strong>Patient Name:</strong> ${patient.name}</p>
        <p><strong>Patient Email:</strong> ${patient.email}</p>

        <h3>Message:</h3>
        <p>${message}</p>

        <hr/>
        <small>MediTrack Health System</small>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Mail sent successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Mail sending failed." });
  }
});

module.exports = router;