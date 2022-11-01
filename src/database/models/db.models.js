const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const db = {}

db.mongoose = mongoose

db.roles = require('./Users/roles.model')
db.user = require('./Users/user.model')

module.exports = db
