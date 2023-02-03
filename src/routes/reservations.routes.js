const controller = require('../controllers/reservations.controller')
const router = require('express').Router()

router.post('/', controller.createReservation)

router.post('/cancel/:id', controller.cancelReservation)

router.post('/complete/:id', controller.finishReservation)

router.get('/', controller.getReservations)

router.get('/:id', controller.getReservation)

router.put('/:id', controller.updateReservation)

router.delete('/:id', controller.deleteReservation)

module.exports = router
