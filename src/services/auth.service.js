const db = require('../database/models/db.models')
const User = db.user
const Roles = db.roles
const JWT = require('jsonwebtoken')
const encription = require('../libs/encription')

exports.signUp = async (fullname, email, password, phoneNumber, idNumber, address, roles = null) => {
  try {
    if (!roles) {
      roles = await Roles.findOne({ name: 'client' }).select('_id')
    }
    const hashedPassword = await encription.encrypt(password)
    const newUser = new User({
      fullname,
      email,
      idNumber,
      phoneNumber,
      address,
      password: hashedPassword,
      roles
    })
    await newUser.save()
    return {
      data: newUser
    }
  } catch (error) {
    throw new Error(error)
  }
}
