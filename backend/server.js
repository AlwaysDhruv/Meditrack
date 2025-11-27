require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ROUTES
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const recordRoutes = require('./routes/records');
const tipsRoutes = require('./routes/tips');
const passwordRoutes = require('./routes/password');
const analyzeRoute = require("./routes/records-analyze");
const chatDoctorRoute = require("./routes/chat-doctor");
const doctorRoutes = require("./routes/doctors");
const mailRoutes = require("./routes/mail");
const doctorPatientRecords = require("./routes/doctor-patient-records");
const doctorDashboardRoute = require("./routes/doctor-dashboard");
const doctorMail = require("./routes/doctor-mail");

const app = express();
app.use(cors());
app.use(express.json());

// -------------------- API ROUTES --------------------

// AUTH
app.use('/api/auth', authRoutes);

// APPOINTMENTS
app.use('/api/appointments', appointmentRoutes);

// AI ANALYSIS ROUTE (must come BEFORE /api/records)
app.use('/api/record', analyzeRoute);

// MAIN RECORDS CRUD
app.use('/api/records', recordRoutes);

// HEALTH TIPS
app.use('/api/tips', tipsRoutes);

// PASSWORD RESET
app.use('/api/password', passwordRoutes);

// CHAT WITH DOCTOR
app.use("/api/chat-doctor", chatDoctorRoute);

// DOCTORS LIST + PROFILE
app.use("/api/doctors", doctorRoutes);

// MAIL SERVICE
app.use("/api/mail", mailRoutes);

// DOCTOR PANEL – patient list + health record access
app.use("/api/doctor/patient-records", doctorPatientRecords);
app.use("/api/doctor/mail", doctorMail);
app.use("/api/doctor/dashboard", doctorDashboardRoute);
// -------------------- DB + SERVER --------------------

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
})
.catch(err => console.error(err));
