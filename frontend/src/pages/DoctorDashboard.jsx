import { useState, useEffect } from 'react'
import API from '../api'

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([])

  useEffect(() => {
    fetchAppointments()
  }, [])

  function fetchAppointments(){
    API.get('/appointments').then(r => setAppointments(r.data.appointments))
  }

  async function updateStatus(id, status){
    await API.post(`/appointments/${id}/status`, { status })
    fetchAppointments()
  }

  return (
    <div>
      <h2>Doctor Dashboard</h2>

      {appointments.map(a => (
        <div key={a._id}>
          <strong>{new Date(a.date).toLocaleString()}</strong>
          {' '}Patient: {a.patient.name} — {a.status}

          <div>
            <button onClick={()=>updateStatus(a._id, 'accepted')}>Accept</button>
            <button onClick={()=>updateStatus(a._id, 'rejected')}>Reject</button>
            <button onClick={()=>updateStatus(a._id, 'completed')}>Completed</button>
          </div>
        </div>
      ))}
    </div>
  )
}
