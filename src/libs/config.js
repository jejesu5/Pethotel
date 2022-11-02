require('dotenv').config()

module.exports = {
  SECRET: process.env.SECRET,
  emailConfig: {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASS
    }
  },
  database: process.env.DATABASE_URI
}
