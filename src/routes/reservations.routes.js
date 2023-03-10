const controller = require('../controllers/reservations.controller')
const router = require('express').Router()

router.post('/', controller.createReservation)

router.post('/cancel/:id', controller.cancelReservation)

router.post('/complete/:id', controller.finishReservation)

router.post('/confirm/:id', controller.confirmReservation)

router.get('/', controller.getReservations)

router.get('/:id', controller.getReservation)

router.get('/client/:id', controller.getUserReservations)

router.put('/:id', controller.updateReservation)

router.delete('/:id', controller.deleteReservation)

module.exports = router
