const authController = require('../controllers/auth.controller')
const userController = require('../controllers/user.controller')
const validations = require('../middlewares/validations.middleware')
const router = require('express').Router()

// sign up an user
router.post('/signup', [validations.checkFields,
  validations.checkEmailExists,
  validations.checkRolesExist], authController.signUp)

// sign in an user
router.post('/signin', validations.checkUserExists, authController.signIn)

// send OTP code to email
router.post('/sendOTP',
  [validations.checkUserExists],
  authController.sendOTPcode)

// verify OTP code (just when its email verification)
router.post('/verify',
  [validations.checkVerifyEmail,
    validations.checkUserExists],
  authController.verifyEmail
)

// verify OTP code (just when its password recovery)
router.post('/recovery',
  [validations.checkRecoveryPassword,
    validations.checkUserExists],
  authController.recoveryPassword)

// get all users
router.get('/', userController.getAllUser)

// get user by id
router.get('/:id', validations.checkUserExistsById, userController.getUserById)

// modify user
router.put('/:id', validations.checkUserExistsById, userController.modifyUser)

// delete user
router.delete('/:id', validations.checkUserExistsById, userController.deleteUser)

module.exports = router
