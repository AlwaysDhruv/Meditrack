const mongoose = require('mongoose')

const PasswordOTPSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true }
})

module.exports = mongoose.model('PasswordOTP', PasswordOTPSchema)
