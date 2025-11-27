import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../api'
import '../styles/auth.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const res = await API.post('/auth/login', form)

    localStorage.setItem('meditrack_token', res.data.token)
    localStorage.setItem('meditrack_user', JSON.stringify(res.data.user))

    if (res.data.user.role === 'doctor') nav('/doctor')
    else nav('/patient')
  }

  return (
    <div className="auth-container">
      <form onSubmit={submit} className="auth-box">
        <h2>Login</h2>

        <input 
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e)=>setForm({...form, email:e.target.value})}
          required
        />

        <input 
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e)=>setForm({...form, password:e.target.value})}
          required
        />

        <button>Sign In</button>

        <div className="auth-extra">
          New here? <Link to="/register">Create account</Link>
        </div>
        <div className="auth-extra">
          Forgot your password? <Link to="/forgot-password">Reset it</Link>
        </div>
      </form>
    </div>
  )
}
