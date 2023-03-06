const { Schema, model } = require('mongoose')

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  roles: {
    type: Schema.Types.ObjectId
  },
  phoneNumber: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  address: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  guarderia_start: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reservations: [{
    type: Schema.Types.ObjectId,
    ref: 'reservations'
  }]
})

const user = model('user', userSchema)

module.exports = user
