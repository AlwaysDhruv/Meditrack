const express = require("express");
const Appointment = require("../models/Appointment");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

/* ------------------------------------------------------------------
   DASHBOARD DATA FOR DOCTOR
------------------------------------------------------------------ */
router.get("/", auth, async (req, res) => {
  try {
    const doctorId = req.user._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1) Today's appointments
    const todaysAppointments = await Appointment.countDocuments({
      doctor: doctorId,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // 2) Total unique patients for this doctor
    const patientIds = await Appointment.distinct("patient", { doctor: doctorId });
    const totalPatients = patientIds.length;

    // 3) Pending requests
    const pendingRequests = await Appointment.countDocuments({
      doctor: doctorId,
      status: "requested"
    });

    // 4) Upcoming appointments (next 5)
    const upcoming = await Appointment.find({
      doctor: doctorId,
      date: { $gte: new Date() }
    })
      .populate("patient", "name")
      .sort({ date: 1 })
      .limit(5);

    res.json({
      todaysAppointments,
      totalPatients,
      pendingRequests,
      upcoming
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard data failed." });
  }
});

module.exports = router;
