const express = require('express')
const User = require('../models/User')
const PasswordOTP = require('../models/PasswordOTP')
const { sendMail } = require('../utils/mail')
const bcrypt = require('bcryptjs')

const router = express.Router()

// SEND OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ message: "Email not found" })

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  await PasswordOTP.deleteMany({ email })

  await PasswordOTP.create({
    email,
    otp: code,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
  })

  await sendMail({
    to: email,
    subject: "MediTrack Password Reset OTP",
    html: `<h2>Your OTP</h2><p style="font-size: 20px;">${code}</p>`
  })

  res.json({ message: "OTP sent to email" })
})


// VERIFY OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body

  const record = await PasswordOTP.findOne({ email, otp })
  if (!record) return res.status(400).json({ message: "Invalid OTP" })

  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" })

  res.json({ message: "OTP verified" })
})


// RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  const { email, password } = req.body

  const hashed = await bcrypt.hash(password, 10)
  await User.updateOne({ email }, { password: hashed })

  await PasswordOTP.deleteMany({ email })

  res.json({ message: "Password updated" })
})

module.exports = router
