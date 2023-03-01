const db = require('../database/models/db.models')
const User = db.user
const Roles = db.roles
const OTP = db.OTP
const JWT = require('jsonwebtoken')
const encription = require('../libs/encription')
const config = require('../libs/config')
const mailTemplate = require('../libs/mailTemplate')
const sendMail = require('../libs/sendmail')

exports.signUp = async (name, lastName, email, password, phoneNumber, idNumber, roles = null, address) => {
  try {
    if (!roles) {
      roles = await Roles.findOne({ name: 'client' }).select('_id')
    }
    const hashedPassword = await encription.encrypt(password)
    const formatEmail = email.toLowerCase()
    const newUser = new User({
      name,
      lastName,
      email: formatEmail,
      idNumber,
      phoneNumber,
      password: hashedPassword,
      roles,
      address
    })
    const mensaje = {
      from: process.env.EMAIL_SENDER,
      to: formatEmail,
      subject: 'Bienvenido a Galo',
      html: mailTemplate({
        title: `¡${name}, bienvenido a Galo!`,
        description: `Es un placer darle la bienvenida a nuestra plataforma de cuidado de animales. Estamos emocionados de tenerlo como parte de nuestra comunidad de amantes de los animales.<br>

        Nos esforzamos por ofrecerle los mejores servicios para el cuidado de sus mascotas, incluyendo hospedaje, guardería y spa. Con nuestra amplia selección de opciones y cuidadores confiables, estamos seguros de que encontrará el lugar perfecto para su mascota.<br>
        
        Además, nuestra plataforma es fácil de usar y le permite hacer reservas en línea en pocos clics. Si tiene alguna pregunta o necesita ayuda para navegar por la plataforma, por favor no dude en ponerse en contacto con nosotros. Estamos aquí para ayudarlo.<br>
        
        Gracias por elegirnos y esperamos tener noticias suyas pronto.<br>
        
        Atentamente,<br>
        Equipo Galo`,
        cuadro: '',
        footer: '',
        alert: ''
      })
    }
    await sendMail(config.emailConfig, mensaje)
    await newUser.save()
    return {
      data: newUser
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.signIn = async (email, password) => {
  try {
    const formatEmail = email.toLowerCase()
    const user = await User.findOne({ email: formatEmail }).populate('roles')
    const validation = await encription.compareEncrypt(password, user.password)

    if (!validation) {
      return false
    }

    const token = JWT.sign({ id: user._id }, config.SECRET, { expiresIn: 86400 })

    return {
      accessToken: token,
      id: user._id,
      email: user.email,
      name: `${user.name} ${user.lastName}`,
      roles: user.roles.name,
      isVerified: user.emailVerified,
      address: user.address || 'No definida'
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.sendOTPcode = async (email) => {
  try {
    const checkRequested = await OTP.find({ email })
    if (checkRequested) {
      await OTP.deleteMany({ email })
    }
    const otp = `${Math.floor(1000 + Math.random() * 9000)}`
    const hashedOTP = await encription.encrypt(otp)
    const mensaje = {
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: 'Galo - Nuevo codigo de Verificación',
      html: mailTemplate({
        title: 'Nuevo codigo de verificación',
        description: 'Tu código es:',
        cuadro: `${otp}`,
        footer: 'Por favor, ingresa este código en el campo requerido',
        alert: '¡Este código expira en una hora!'
      })
    }
    const OTPVerification = new OTP({
      email,
      OTP: hashedOTP,
      createdAt: Date.now(),
      ExpiredAt: Date.now() + 3600000
    })

    await Promise.all([sendMail(config.emailConfig, mensaje),
      OTPVerification.save()])
      .then(console.log('email sent'))
      .catch(error => console.log(error))

    return { msg: 'Código OTP enviado' }
  } catch (error) {
    throw new Error(error)
  }
}

/**
 * this service receives email, code, password and validates code with OTP register
 * if valid, in case it just has email as param, it validate User and set attribute "isVerifed" true
 * if has password as param, updates user password
 * @param {*} email
 * @param {*} code
 * @param {*} password (could be null)
 * @returns
 */
exports.verifyOTP = async (email, code, password = null) => {
  try {
    const checkOTP = await OTP.find({ email })
    if (!checkOTP.length) {
      return {
        status: 404,
        message: 'Cuenta invalida o ya verificada'
      }
    } else {
      const expiration = checkOTP[0].ExpiredAt
      const hashedOTP = checkOTP[0].OTP

      if (expiration < Date.now()) {
        await OTP.deleteMany({ email })
        return {
          status: 404,
          message: 'El código ha expirado, por favor solicita uno nuevo'
        }
      }
      const validOTP = await encription.compareEncrypt(code, hashedOTP)
      if (!validOTP) {
        return {
          status: 404,
          message: 'El codigo OTP es invalido'
        }
      }
      if (password && validOTP) {
        const newPassword = await encription.encrypt(password)

        await User.findOneAndUpdate(
          { email },
          { $set: { password: newPassword } },
          { new: true }
        )

        await OTP.deleteMany({ email })

        return {
          status: 200,
          message: `password from email ${email} has been changed`
        }
      } else {
        await User.findOneAndUpdate(
          { email },
          { $set: { isVerified: true } },
          { new: true }
        )
        await OTP.deleteMany({ email })
        return {
          status: 200,
          message: `email ${email} has been verified`
        }
      }
    }
  } catch (error) {
    throw new Error(error)
  }
}
