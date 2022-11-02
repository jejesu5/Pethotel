/* eslint-disable */
const { check, validationResult } = require('express-validator')
const db = require('../database/models/db.models')
const User = db.user
const Roles = db.roles

function validateFields (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }
  next()
}
// checkFields for SignUp
checkFields = [
  check('fullname').exists()
    .withMessage('Nombre completo es obligatorio').trim()
    .isString().isLength({ min: 3 }).withMessage('El nombre debe tener al menos 3 caracteres'),
  check('idNumber', 'el id debe tener al menos 5 caracteres').exists().trim().isLength({ min: 5 }),
  check('phoneNumber', 'phoneNumber is required').exists().trim().isLength({ min: 10 }),
  check('email', 'email format is incorrect').exists()
    .trim().isEmail().normalizeEmail({ gmail_remove_dots: false }),
  check('password').exists().isLength({ min: 5 }).withMessage('La contraseña debe tener al menos 5 caracteres')
    .matches('[A-Z]').withMessage('password must contain an uppercase letter')
    .matches('[0-9]').withMessage('password must contain an number').trim(),
  validateFields
]

// verify an email isnt already in database
async function checkEmailExists (req, res, next) {
  try {
    const mail = await User.findOne({ email: req.body.email })
    if (mail) {
      return res.status(400).send({ msg: 'Email ya está en uso' })
    }
    next()
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

// check if roles provided exist in database
async function checkRolesExist (req, res, next) {
  const { roles } = req.body
  try {
    if (roles) {
      for (let i = 0; i < roles.length; i++) {
        const findrole = await Roles.findOne({ name: roles[i] })
        if (findrole) continue
        else return res.status(400).send({ msg: 'role not found' })
      }
      next()
    } else {
      next()
    }
  } catch (error) {
    return res.status(500).send({ error: error.message })
  }
}

// check fields for password recovery
checkRecoveryPassword = [
  check('email', 'email format is incorrect').exists()
    .trim().isEmail().normalizeEmail({ gmail_remove_dots: false }),
  check('password').isLength({ min: 5 }).withMessage('password must be at least 5 characters')
    .matches('[A-Z]').withMessage('password must contain an uppercase letter')
    .matches('[0-9]').withMessage('password must contain an number').trim(),
  check('code', 'code is not valid').exists().trim().isLength({ min: 4 }),
  validateFields
]

// check fields for email verification
checkVerifyEmail = [
  check('email', 'email format is incorrect').exists()
    .trim().isEmail().normalizeEmail({ gmail_remove_dots: false }),
  check('code', 'code is not valid').exists().trim().isLength({ min: 4 }),
  validateFields
]


// check if an user exists
async function checkUserExists (req, res, next) {
  try {
    const mail = await User.findOne({ email: req.body.email })
    if (!mail) {
      return res.status(400).send('usuario no encontrado')
    }
    next()
  } catch (error) {
    return res.status(500).send(error.message)
  }
}
async function checkUserExistsById (req, res, next) {
  try {
    if (!req.params.id) {
      return res.status(400).send('id is required')
    }
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(400).send('usuario no encontrado')
    }

    next()
  } catch (error) {
    return res.status(500).send(error.message)
  }
}

module.exports = {
  checkFields,
  checkEmailExists,
  checkRolesExist,
  checkVerifyEmail,
  checkRecoveryPassword,
  checkUserExists,
  checkUserExistsById,
}
