import { useState } from 'react'
import API from '../api'
import '../styles/auth.css'
import { useNavigate } from 'react-router-dom'

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const email = localStorage.getItem('reset_email')
  const nav = useNavigate()

  async function reset(e) {
    e.preventDefault()
    await API.post('/password/reset-password', { email, password })

    alert("Password changed successfully!")
    localStorage.removeItem("reset_email")
    nav('/login')
  }

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={reset}>
        <h2>Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button>Update Password</button>
      </form>
    </div>
  )
}
