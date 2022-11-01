const { Schema, model } = require('mongoose')

const roleSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: true
  }
})

const roles = model('roles', roleSchema)

module.exports = roles
