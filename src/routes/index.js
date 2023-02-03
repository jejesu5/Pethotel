const { Router } = require('express')
const router = Router()
const userRoutes = require('./user.routes')
const reservationRoutes = require('./reservations.routes')

router.use('/user', userRoutes)

router.use('/reservation', reservationRoutes)

module.exports = router
