import { useEffect, useState } from "react"
import API from "../api"
import "./patient.css"

export default function AppointmentPage() {
  const [doctors, setDoctors] = useState([])
  const [appointments, setAppointments] = useState([])

  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    doctorId: "",
    date: "",
    reason: ""
  })

  useEffect(() => {
    loadDoctors()
    loadAppointments()
  }, [])

  function loadDoctors() {
    API.get("/auth/doctors").then(res => setDoctors(res.data.doctors))
  }

  function loadAppointments() {
    API.get("/appointments").then(res => setAppointments(res.data.appointments))
  }

  function openModal() {
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setForm({ doctorId: "", date: "", reason: "" })
  }

  /* -------------------------------------------
     BOOK APPOINTMENT (with proper error message)
  ------------------------------------------- */
  async function bookAppointment(e) {
    e.preventDefault()

    try {
      const res = await API.post("/appointments/request", form)

      alert(res.data.message || "Appointment requested successfully!")

      loadAppointments()
      closeModal()

    } catch (err) {
      console.error(err)

      // Show backend message
      const msg = err.response?.data?.message || "Failed to book appointment."
      alert(msg)
    }
  }

  return (
    <div className="page">

      {/* Page Header */}
      <div className="page-header">
        <h1>Appointments</h1>
        <button className="book-btn" onClick={openModal}>+ Book Appointment</button>
      </div>

      {/* Appointment List */}
      <div className="appointment-list">
        {appointments.map(appt => (
          <div className="appointment-card" key={appt._id}>
            <div className="appt-info">
              <h3>{new Date(appt.date).toLocaleString()}</h3>
              <p>Doctor: <b>{appt.doctor.name}</b></p>
              <p>Status: <span className={`status ${appt.status}`}>{appt.status}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h2>Book Appointment</h2>

            <form onSubmit={bookAppointment}>

              <label>Choose Doctor</label>
              <select
                value={form.doctorId}
                onChange={(e)=>setForm({ ...form, doctorId: e.target.value })}
                required
              >
                <option value="">Select doctor</option>
                {doctors.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.specialization})
                  </option>
                ))}
              </select>

              <label>Select Date & Time</label>
              <input
                type="datetime-local"
                min={new Date().toISOString().slice(0, 16)}  // Prevent past dates
                value={form.date}
                onChange={(e)=>setForm({ ...form, date: e.target.value })}
                required
              />

              <label>Reason (optional)</label>
              <textarea
                placeholder="Reason for appointment..."
                value={form.reason}
                onChange={(e)=>setForm({ ...form, reason: e.target.value })}
              />

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeModal}>Cancel</button>
                <button type="submit" className="save-btn">Book</button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  )
}
