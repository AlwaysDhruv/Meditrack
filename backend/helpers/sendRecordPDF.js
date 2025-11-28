const PDFDocument = require("pdfkit");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const HealthRecord = require("../models/HealthRecord");

async function sendRecordPDF(recordId) {
  const record = await HealthRecord.findById(recordId)
    .populate("patient")
    .populate("doctor");

  if (!record) return;

  const patient = record.patient;
  if (!patient || !patient.email) return;

  // Create PDF
  const doc = new PDFDocument();
  let buffers = [];
  doc.on("data", buffers.push.bind(buffers));
  doc.on("end", async () => {
    let pdfData = Buffer.concat(buffers);

    // Email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"MediTrack" <${process.env.SMTP_USER}>`,
      to: patient.email,
      subject: "Your Updated Health Record",
      text: "Attached is your updated medical record.",
      attachments: [
        {
          filename: "HealthRecord.pdf",
          content: pdfData
        }
      ]
    });

    console.log("PDF sent to patient:", patient.email);
  });

  // PDF content
  doc.fontSize(20).text("Health Record", { underline: true });
  doc.moveDown();

  doc.fontSize(14).text(`Patient: ${patient.name}`);
  doc.text(`Doctor: ${record.doctor ? record.doctor.name : "N/A"}`);
  doc.text(`Date: ${new Date(record.createdAt).toLocaleString()}`);
  doc.moveDown();

  doc.text("Notes:");
  doc.text(record.notes);
  doc.moveDown();

  doc.text("Prescriptions:");
  doc.text(record.prescriptions.join(", "));
  doc.moveDown();

  doc.text("Vitals:");
  doc.text(`BP: ${record.vitals.bp}`);
  doc.text(`Pulse: ${record.vitals.pulse}`);
  doc.text(`Temp: ${record.vitals.temp}`);

  doc.end();
}

module.exports = sendRecordPDF;
