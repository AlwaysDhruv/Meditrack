import { useState } from 'react'
import API from '../api'
import '../styles/auth.css'
import { useNavigate } from 'react-router-dom'

export default function VerifyOTP() {
  const [otp, setOtp] = useState("")
  const email = localStorage.getItem('reset_email')
  const nav = useNavigate()

  async function verify(e) {
    e.preventDefault()
    await API.post('/password/verify-otp', { email, otp })
    nav('/reset-password')
  }

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={verify}>
        <h2>Verify OTP</h2>

        <input
          placeholder="Enter the 6 digit OTP"
          value={otp}
          onChange={(e)=>setOtp(e.target.value)}
          required
        />

        <button>Verify</button>
      </form>
    </div>
  )
}
