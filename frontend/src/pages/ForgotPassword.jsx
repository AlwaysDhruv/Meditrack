import { useState } from 'react'
import API from '../api'
import '../styles/auth.css'
import { useNavigate } from 'react-router-dom'

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const nav = useNavigate()

  async function sendOTP(e) {
    e.preventDefault()
    await API.post('/password/send-otp', { email })
    localStorage.setItem("reset_email", email)
    alert("OTP sent to your email.")
    nav('/verify-otp')
  }

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={sendOTP}>
        <h2>Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter your registered email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />
        <button>Send OTP</button>

      </form>
    </div>
  )
}
