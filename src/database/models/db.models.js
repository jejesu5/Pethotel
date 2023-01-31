const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.roles = require('./Users/roles.model')
db.user = require('./Users/user.model')
db.OTP = require('./Users/OTP.model')
db.reservations = require('./Reservations/reservations.model')
module.exports = db
