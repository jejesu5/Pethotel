const services = require('../services/reservations.service')

exports.createReservation = async (req, res) => {
  try {
    const reservation = await services.createReservation(req.body)

    return res.status(201).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.getReservations = async (req, res) => {
  try {
    const { skip, limit } = req.query

    const reservations = await services.getReservations(skip, limit)

    return res.status(200).send(reservations)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.getReservation = async (req, res) => {
  try {
    const { id } = req.params

    const reservation = await services.getReservation(id)

    if (!reservation) {
      return res.status(404).send({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.updateReservation = async (req, res) => {
  try {
    const { id } = req.params

    const reservation = await services.updateReservation(id, req.body)

    if (!reservation) {
      return res.status(404).send({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.deleteReservation = async (req, res) => {
  try {
    const { id } = req.params

    const reservation = await services.deleteReservation(id)

    if (!reservation) {
      return res.status(404).send({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params

    const reservation = await services.cancelReservation(id)

    if (!reservation) {
      return res.status(404).send({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.finishReservation = async (req, res) => {
  try {
    const { id } = req.params

    const reservation = await services.finishReservation(id)

    if (!reservation) {
      return res.status(404).send({
        status: 'error',
        message: 'Reservation not found'
      })
    }

    return res.status(200).send(reservation)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}

exports.getUserReservations = async (req, res) => {
  try {
    const { id } = req.params

    const reservations = await services.getUserReservations(id)

    return res.status(200).send(reservations)
  } catch (error) {
    return res.status(500).send({
      status: 'error',
      message: error.message
    })
  }
}
