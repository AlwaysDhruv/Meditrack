const mongoose = require('mongoose');

const HealthRecordSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  prescriptions: [{ type: String }],
  vitals: {
    bp: String,
    pulse: String,
    temp: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthRecord', HealthRecordSchema);
