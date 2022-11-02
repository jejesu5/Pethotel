const { Schema, model } = require('mongoose')

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  OTP: String,
  createdAt: Date,
  ExpiredAt: Date
})

const userOTP = model(
  'otp',
  otpSchema
)

module.exports = userOTP
