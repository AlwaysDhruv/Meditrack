const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const auth = require('../middleware/auth');
const sendRecordPDF = require("../helpers/sendRecordPDF");

const router = express.Router();

/* ---- CREATE RECORD (Doctor only) ---- */
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only doctors can create records" });

    const { patientId, notes, prescriptions, vitals } = req.body;

    const record = new HealthRecord({
      patient: patientId,
      doctor: req.user._id,
      notes,
      prescriptions,
      vitals
    });

    await record.save();

    // Send updated PDF to patient
    sendRecordPDF(record._id);

    res.json({ record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---- GET RECORDS ---- */
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;

    if (req.user.role === "patient" && req.user._id.toString() !== id)
      return res.status(403).json({ message: "Not allowed" });

    const records = await HealthRecord.find({ patient: id }).populate("doctor");
    res.json({ records });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---- UPDATE RECORD (Doctor only) ---- */
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only doctors can update records" });

    const { notes, prescriptions, vitals } = req.body;

    const updated = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      { notes, prescriptions, vitals },
      { new: true }
    );

    // Send updated PDF
    sendRecordPDF(updated._id);

    res.json({ record: updated });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ---- DELETE RECORD ---- */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== "doctor")
      return res.status(403).json({ message: "Only doctors can delete records" });

    await HealthRecord.findByIdAndDelete(req.params.id);

    res.json({ message: "Record deleted" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
