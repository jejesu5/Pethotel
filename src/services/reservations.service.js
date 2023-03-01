const db = require('../database/models/db.models')
const Reservations = db.reservations
const User = db.user
const mailTemplate = require('../libs/mailTemplate')
const sendMail = require('../libs/sendmail')
const config = require('../libs/config')

exports.createReservation = async (info) => {
  try {
    const reservation = await Reservations.create(info)

    const user = await User.findByIdAndUpdate(info.client, { $push: { reservations: reservation._id } })

    if (!user.address && info.address_pickup) {
      await User.findByIdAndUpdate(user._id, { address: info.address_pickup })
    }
    if (reservation.service_type === 'hotel') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Confirmación de Reserva',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer poder confirmarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${reservation._id}<br>
          Tipo de servicio: ${reservation.service_type}<br>
          Fecha de llegada: ${reservation.start_date}<br>
          Fecha de salida: ${reservation.end_date}<br>
          Pickup: ${reservation.pickUp ? 'Sí' : 'No'}<br>
          ${reservation.pickUp ? `Dirección de recogida: ${reservation.address_pickup} <br>` : null}
          Número de mascotas: ${reservation.pets_count}<br><br>
      
      Si tiene alguna pregunta o necesita hacer algún cambio en su reserva, por favor no dude en ponerse en contacto con nosotros. Estamos a su disposición para ayudarle en lo que necesite.`,
          cuadro: '',
          footer: 'Gracias por confiar en nosotros.',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }

    if (reservation.service_type === 'spa') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Confirmación de Reserva',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer poder confirmarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${reservation._id}<br>
          Tipo de servicio: ${reservation.service_type}<br>
          fecha de reserva: ${reservation.start_date}<br>
          Servicios solicitados: ${reservation.spa_services.join(' , ')}<br>
          Pickup: ${reservation.pickUp ? 'Sí' : 'No'}<br>
          ${reservation.pickUp ? `Dirección de recogida: ${reservation.address_pickup} <br>` : null}
          Número de mascotas: ${reservation.pets_count}<br><br>
      
      Si tiene alguna pregunta o necesita hacer algún cambio en su reserva, por favor no dude en ponerse en contacto con nosotros. Estamos a su disposición para ayudarle en lo que necesite.`,
          cuadro: '',
          footer: 'Gracias por confiar en nosotros.',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }

    if (reservation.service_type === 'guarderia') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Confirmación de Reserva',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer poder confirmarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${reservation._id}<br>
          Tipo de servicio: ${reservation.service_type}<br>
          Dias de guarderia: ${reservation.guarderia_dias}<br>
          Duración de guarderia: ${reservation.guarderia_duracion}<br>
          Pickup: ${reservation.pickUp ? 'Sí' : 'No'}<br>
          ${reservation.pickUp ? `Dirección de recogida: ${reservation.address_pickup} <br>` : null}
          Número de mascotas: ${reservation.pets_count}<br><br>
      
      Si tiene alguna pregunta o necesita hacer algún cambio en su reserva, por favor no dude en ponerse en contacto con nosotros. Estamos a su disposición para ayudarle en lo que necesite.`,
          cuadro: '',
          footer: 'Gracias por confiar en nosotros.',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }

    return {
      status: 'success',
      msg: 'Reserva creada con éxito',
      data: reservation
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.getReservations = async (skip, limit) => {
  try {
    skip = parseInt(skip)
    limit = parseInt(limit)

    const count = await Reservations.count({ isActive: true })
    const reservations = await Reservations.find({ isActive: true }).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    }).skip(skip * limit).limit(limit)

    return {
      currentPage: skip,
      maxPage: Math.ceil(count / limit),
      data: reservations
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.getReservation = async (id) => {
  try {
    const reservation = await Reservations.findById(id).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    })

    if (!reservation) {
      return false
    }

    return {
      status: 'success',
      data: reservation
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.updateReservation = async (id, info) => {
  try {
    const toUpdate = await Reservations.findByIdAndUpdate(id, info, { new: true })

    if (!toUpdate) {
      return false
    }

    return {
      status: 'success',
      msg: 'Reserva actualizada con éxito',
      data: toUpdate
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.deleteReservation = async (id) => {
  try {
    const toDelete = await Reservations.findByIdAndUpdate(id, { isActive: false }, { new: true })

    if (!toDelete) {
      return false
    }

    return {
      status: 'success',
      msg: 'Reserva eliminada con éxito',
      data: toDelete
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.cancelReservation = async (id) => {
  try {
    const toCancel = await Reservations.findByIdAndUpdate(id, { status: 'canceled' }, { new: true }).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    })

    if (!toCancel) {
      return false
    }

    const mensaje = {
      from: process.env.EMAIL_SENDER,
      to: toCancel.client.email,
      subject: 'Reserva Cancelada',
      html: mailTemplate({
        title: `¡Hola ${toCancel.client.name}!`,
        description: `Te escribimos para confirmar la cancelación de su reserva con número ${toCancel._id}<br>

        Lamento cualquier inconveniente que esto pueda causarle. Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nosotros.<br>
        
        Agradecemos su comprensión y esperamos tener la oportunidad de atenderle en el futuro.`,
        cuadro: '',
        footer: '',
        alert: ''
      })
    }
    await sendMail(config.emailConfig, mensaje)

    return {
      status: 'success',
      msg: 'Reserva cancelada con éxito',
      data: toCancel
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.finishReservation = async (id) => {
  try {
    const toFinish = await Reservations.findByIdAndUpdate(id, { status: 'completed' }, { new: true }).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    })

    if (!toFinish) {
      return false
    }

    const mensaje = {
      from: process.env.EMAIL_SENDER,
      to: toFinish.client.email,
      subject: 'Reserva Completada',
      html: mailTemplate({
        title: `¡Hola ${toFinish.client.name}!`,
        description: `Tu reserva ${toFinish._id} se ha completado<br>

        Esperamos que su experiencia haya sido satisfactoria y que haya disfrutado de nuestros servicios.<br>
        
        Si tiene alguna pregunta o necesita más información, no dude en ponerse en contacto con nosotros.`,
        cuadro: '',
        footer: 'Gracias por confiar en nosotros.',
        alert: ''
      })
    }
    await sendMail(config.emailConfig, mensaje)

    return {
      status: 'success',
      msg: 'Reserva finalizada con éxito',
      data: toFinish
    }
  } catch (error) {
    throw new Error(error)
  }
}

exports.getUserReservations = async (id) => {
  try {
    const reservations = await Reservations.find({ client: id, isActive: true })

    return {
      status: 'success',
      data: reservations
    }
  } catch (error) {
    throw new Error(error)
  }
}
