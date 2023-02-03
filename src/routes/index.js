const { Router } = require('express')
const router = Router()
const userRoutes = require('./user.routes')

router.use('/user', userRoutes)

router.use('/reservation', require('./reservation.routes'))

module.exports = router
