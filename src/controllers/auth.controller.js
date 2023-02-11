const services = require('../services/auth.service')

exports.signUp = async (req, res) => {
  try {
    const { name, lastName, email, password, phoneNumber, idNumber, roles, address } = req.body
    const user = await services.signUp(name, lastName, email, password, phoneNumber, idNumber, roles, address)
    return res.status(200).json({
      message: 'Usuario creado exitosamente',
      user
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

exports.signIn = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await services.signIn(email, password)
    if (!user) {
      return res.status(401).json({
        message: 'Email o contraseña incorrectos'
      })
    }
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}

exports.sendOTPcode = async (req, res) => {
  try {
    const { email } = req.body
    const sendEmail = await services.sendOTPcode(email)

    return res.send(sendEmail)
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

exports.verifyEmail = async (req, res) => {
  try {
    const { code, email } = req.body

    const verify = await services.verifyOTP(email, code)

    return res.status(verify.status).send({
      msg: verify.message
    })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

exports.recoveryPassword = async (req, res) => {
  try {
    const { code, email, password } = req.body

    const verify = await services.verifyOTP(email, code, password)

    return res.status(verify.status).send({
      msg: verify.message
    })
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
