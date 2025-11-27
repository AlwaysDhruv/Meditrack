const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const auth = require("../middleware/auth");
const { sendMail } = require("../utils/mail");

// ----------------------------------------------------------------------
// PATIENT → CREATE APPOINTMENT REQUEST
// ----------------------------------------------------------------------
router.post('/request', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient')
      return res.status(403).json({ message: 'Only patients can request.' });

    const { doctorId, date, reason } = req.body;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor')
      return res.status(400).json({ message: 'Invalid doctor.' });

    const now = new Date();
    const chosenDate = new Date(date);

    // -----------------------------------------------------------
    // ⛔ BLOCK PAST DATES
    // -----------------------------------------------------------
    if (chosenDate < now) {
      return res.status(400).json({
        message: "Past dates are not allowed. Please choose a future time."
      });
    }

    // -----------------------------------------------------------
    // 🔥 CHECK IF THIS TIME IS ALREADY BOOKED
    // -----------------------------------------------------------
    const conflict = await Appointment.findOne({
      doctor: doctorId,
      date: chosenDate,
      status: { $ne: "rejected" }
    });

    if (conflict) {
      return res.status(400).json({
        message: "This appointment time is already booked. Pick another slot."
      });
    }

    // Create appointment
    const appt = new Appointment({
      patient: req.user._id,
      doctor: doctorId,
      date: chosenDate,
      reason
    });

    await appt.save();

    // Email both
    await sendMail({
      to: `${req.user.email}, ${doctor.email}`,
      subject: "New Appointment Requested",
      html: `
        <h3>New Appointment Request</h3>
        <p><b>Patient:</b> ${req.user.name}</p>
        <p><b>Date:</b> ${chosenDate.toLocaleString()}</p>
        <p><b>Reason:</b> ${reason}</p>
      `
    });

    res.json({ appointment: appt });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----------------------------------------------------------------------
// DOCTOR → UPDATE APPOINTMENT STATUS
// ----------------------------------------------------------------------
router.post("/:id/status", auth, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient doctor");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found." });

    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only doctors may update." });

    if (appointment.doctor._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized." });

    // -----------------------------------------------------------
    // ⛔ BLOCK UPDATING PAST APPOINTMENTS
    // -----------------------------------------------------------
    const now = new Date();
    if (new Date(appointment.date) < now) {
      return res.status(400).json({
        message: "Cannot update a past appointment."
      });
    }

    appointment.status = status;
    await appointment.save();

    // Email Notification
    await sendMail({
      to: `${appointment.patient.email}, ${appointment.doctor.email}`,
      subject: `Appointment ${status}`,
      html: `
        <h3>Your Appointment Has Been Updated</h3>

        <p><b>Doctor:</b> Dr. ${appointment.doctor.name}</p>
        <p><b>Patient:</b> ${appointment.patient.name}</p>
        <p><b>Date:</b> ${new Date(appointment.date).toLocaleString()}</p>

        <p><b>Status:</b> ${status.toUpperCase()}</p>
      `
    });

    res.json({ appointment });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});

// ----------------------------------------------------------------------
// LIST APPOINTMENTS — AUTO BY ROLE
// ----------------------------------------------------------------------
router.get("/", auth, async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "patient") {
      filter.patient = req.user._id;
    }

    if (req.user.role === "doctor") {
      filter.doctor = req.user._id;
    }

    const appts = await Appointment.find(filter)
      .populate("patient doctor")
      .sort({ date: 1 });

    res.json({ appointments: appts });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
