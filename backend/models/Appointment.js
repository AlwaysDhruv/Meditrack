const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: { type: Date, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["requested", "accepted", "rejected", "completed"],
    default: "requested"
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);
