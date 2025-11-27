const express = require("express");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");

const User = require("../models/User");
const Record = require("../models/HealthRecord");
const Appointment = require("../models/Appointment");

const auth = require("../middleware/auth");

const router = express.Router();

/* ------------------------------------------------------------------
   1) GET ALL PATIENTS WHO HAVE APPOINTMENTS WITH THIS DOCTOR
------------------------------------------------------------------ */
router.get("/", auth, async (req, res) => {
  try {
    const doctorId = req.user._id;

    const patientIds = await Appointment.find({ doctor: doctorId })
      .distinct("patient");

    const patients = await User.find({ _id: { $in: patientIds } })
      .select("name email createdAt");

    res.json({ patients });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load patients." });
  }
});

/* ------------------------------------------------------------------
   2) GET PATIENT HEALTH RECORDS
------------------------------------------------------------------ */
router.get("/:patientId/records", auth, async (req, res) => {
  try {
    const doctorId = req.user._id;
    const patientId = req.params.patientId;

    const allowed = await Appointment.findOne({ doctor: doctorId, patient: patientId });

    if (!allowed) {
      return res.status(403).json({ message: "Access denied." });
    }

    const records = await Record.find({ patient: patientId }).sort({ createdAt: -1 });

    res.json({ records });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load records." });
  }
});

/* ------------------------------------------------------------------
   3) DOWNLOAD ONE RECORD AS PDF (UPDATED FIELD NAMES)
------------------------------------------------------------------ */
router.get("/:patientId/record/:recordId/pdf", async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) return res.status(401).json({ message: "No token" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const doctor = await User.findById(payload.id).select("-password");
    if (!doctor) return res.status(401).json({ message: "Invalid user" });

    const { patientId, recordId } = req.params;

    const allowed = await Appointment.findOne({ doctor: doctor._id, patient: patientId });

    if (!allowed) {
      return res.status(403).json({ message: "Not allowed to view this record." });
    }

    const record = await Record.findById(recordId).populate("patient");
    if (!record) return res.status(404).json({ message: "Record not found." });

    // Setup PDF
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${record.patient.name}_record.pdf"`
    );

    const doc = new PDFDocument();
    doc.pipe(res);

    // PDF HEADER
    doc.fontSize(24).text("MediTrack Health Record", { align: "center" });
    doc.moveDown();

    // PATIENT INFO
    doc.fontSize(16).text(`Patient: ${record.patient.name}`);
    doc.text(`Email: ${record.patient.email}`);
    doc.text(`Created: ${new Date(record.createdAt).toLocaleString()}`);
    doc.moveDown();

    // NOTES
    doc.fontSize(14).text("Doctor Notes:");
    doc.text(record.notes || "No notes available");
    doc.moveDown();

    // PRESCRIPTIONS
    doc.text("Prescriptions:");
    if (record.prescriptions?.length > 0) {
      record.prescriptions.forEach((item, idx) => {
        doc.text(`• ${item}`);
      });
    } else {
      doc.text("• None");
    }
    doc.moveDown();

    // VITALS
    doc.text("Vitals:");
    doc.text(`• BP: ${record.vitals?.bp || "N/A"}`);
    doc.text(`• Pulse: ${record.vitals?.pulse || "N/A"}`);
    doc.text(`• Temperature: ${record.vitals?.temp || "N/A"}`);

    doc.end();

  } catch (err) {
    console.error("PDF ERROR:", err);
    res.status(500).json({ message: "PDF generation failed." });
  }
});

module.exports = router;
