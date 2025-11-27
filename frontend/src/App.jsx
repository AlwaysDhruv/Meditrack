import { BrowserRouter, Routes, Route } from "react-router-dom"

// Public Pages
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ForgotPassword from "./pages/ForgotPassword"
import VerifyOTP from "./pages/VerifyOTP"
import ResetPassword from "./pages/ResetPassword"

// Auth
import PrivateRoute from "./components/PrivateRoute"

// Patient Panel
import PatientLayout from "./patient/PatientLayout"
import PatientDashboard from "./patient/PatientDashboard"
import AppointmentPage from "./patient/AppointmentPage"
import RecordsPage from "./patient/RecordsPage"
import HealthTipsPage from "./patient/HealthTipsPage"
import ChatDoctor from "./patient/ChatDoctor"
import MailDoctor from "./patient/MailDoctor"

// Doctor Panel
import DoctorLayout from "./doctor/DoctorLayout"
import DoctorDashboard from "./doctor/DoctorDashboard"
import DoctorAppointments from "./doctor/DoctorAppointments"
import DoctorPatients from "./doctor/DoctorPatients"
import DoctorMail from "./doctor/DoctorMail"
// (Later you will add: DoctorAppointments, DoctorMessages, etc.)

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTES */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================================
              DOCTOR PANEL (PROTECTED)
        ================================= */}
        <Route
          path="/doctor"
          element={
            <PrivateRoute>
              <DoctorLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="appointments" element={<DoctorAppointments />} />
          <Route path="patients" element={<DoctorPatients />} />
          <Route path="mail" element={<DoctorMail />} />
        </Route>

        {/* ================================
               PATIENT PANEL (PROTECTED)
        ================================= */}
        <Route
          path="/patient"
          element={
            <PrivateRoute>
              <PatientLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<PatientDashboard />} />
          <Route path="appointments" element={<AppointmentPage />} />
          <Route path="records" element={<RecordsPage />} />
          <Route path="ai-tips" element={<HealthTipsPage />} />

          {/* Communication */}
          <Route path="chat-doctor" element={<ChatDoctor />} />
          <Route path="mail-doctor" element={<MailDoctor />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}
