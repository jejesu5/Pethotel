const nodemailer = require('nodemailer')

async function sendMail (config, message) {
  const mailTransporter = nodemailer.createTransport(config)

  return await mailTransporter.sendMail(message)
}

module.exports = sendMail
