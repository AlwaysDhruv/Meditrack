import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'
import '../styles/auth.css'

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'patient',
    specialization: ''
  })

  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const res = await API.post('/auth/register', form)

    localStorage.setItem('meditrack_token', res.data.token)
    localStorage.setItem('meditrack_user', JSON.stringify(res.data.user))

    if (res.data.user.role === 'doctor') nav('/doctor')
    else nav('/patient')
  }

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-box">
        <h2>Create Account</h2>

        <input
          placeholder="Full Name"
          value={form.name}
          onChange={(e)=>setForm({...form, name:e.target.value})}
          required
        />

        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e)=>setForm({...form, email:e.target.value})}
          required
        />

        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e)=>setForm({...form, password:e.target.value})}
          required
        />

        <select
          value={form.role}
          onChange={(e)=>setForm({...form, role:e.target.value})}
        >
          <option value="patient">Patient</option>
          <option value="doctor">Doctor</option>
        </select>

        {form.role === 'doctor' && (
          <input
            placeholder="Specialization (e.g., Cardiologist)"
            value={form.specialization}
            onChange={(e)=>setForm({...form, specialization:e.target.value})}
          />
        )}

        <button>Create Account</button>

        <div className="auth-extra">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  )
}
