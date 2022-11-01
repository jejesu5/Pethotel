const services = require('../services/auth.service')

exports.signUp = async (req, res) => {
  try {
    const { fullname, email, password, phoneNumber, idNumber, address, roles } = req.body
    const user = await services.signUp(fullname, email, password, phoneNumber, idNumber, address, roles)
    return res.status(200).json({
      message: 'User created successfully',
      user
    })
  } catch (error) {
    return res.status(500).json({
      message: error.message
    })
  }
}
