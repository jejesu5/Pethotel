const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.roles = require('./Users/roles.model')
db.user = require('./Users/user.model')
db.OTP = require('./users/OTP.model')

module.exports = db
