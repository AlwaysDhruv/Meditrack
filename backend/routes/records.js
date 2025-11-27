const express = require('express');
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// create a record (doctor or patient can create - doctor preferred)
router.post('/', auth, async (req, res) => {
  try {
    const { patientId, notes, prescriptions, vitals } = req.body;
    const rec = new HealthRecord({
      patient: patientId,
      doctor: req.user.role === 'doctor' ? req.user._id : null,
      notes, prescriptions, vitals
    });
    await rec.save();
    res.json({ record: rec });
  } catch (err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
});

// get records for patient
router.get('/patient/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    // only patient themself or doctors can view
    if (req.user.role === 'patient' && req.user._id.toString() !== id) return res.status(403).json({ message: 'Not allowed' });
    const records = await HealthRecord.find({ patient: id }).populate('doctor');
    res.json({ records });
  } catch (err){ console.error(err); res.status(500).json({ message: 'Server error' }); }
});
// UPDATE RECORD
router.put('/:id', auth, async (req, res) => {
  try {
    const { notes, prescriptions, vitals } = req.body

    const record = await HealthRecord.findByIdAndUpdate(
      req.params.id,
      { notes, prescriptions, vitals },
      { new: true }
    )

    res.json({ record })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

// DELETE RECORD
router.delete('/:id', auth, async (req, res) => {
  try {
    await HealthRecord.findByIdAndDelete(req.params.id)
    res.json({ message: "Record deleted" })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router;
