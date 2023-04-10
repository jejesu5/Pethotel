/* eslint-disable */
const db = require('../database/models/db.models')
const Reservations = db.reservations
const Guarderia = db.guarderia
const User = db.user
const mailTemplate = require('../libs/mailTemplate')
const sendMail = require('../libs/sendmail')
const config = require('../libs/config')

/* function obtenerFechasPorDia (diaSemana, fechaInicio, fechaFin) {
  const ajusteZonaHoraria = fechaInicio.getTimezoneOffset() * 60 * 1000 // Convertir minutos a milisegundos
  const fechas = []

  for (let i = 0; i <= (fechaFin - fechaInicio) / (24 * 60 * 60 * 1000); i++) {
    const fecha = new Date(fechaInicio.getTime() + i * 24 * 60 * 60 * 1000)
    const fechaLocal = new Date(fecha.getTime() - ajusteZonaHoraria)

    if (fechaLocal.getDay() === diaSemana) {
      fechas.push(fechaLocal)
    }
  }

  return fechas
} */

function checkStartDay (selectDays) {
  console.log(selectDays)
  let days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']
  let bank = []
  let getCurrentDay = new Date().getDay()
  let fecha = new Date()
  for(let i = 0; i < selectDays.length; i++) {
    if (days.indexOf(selectDays[i]) === getCurrentDay) {
      continue
    } else {
      let day = days.indexOf(selectDays[i])
      let daysUntilNext = (day + 7 - getCurrentDay) % 7;
      // Crear una nueva fecha a partir de la fecha actual
      let nextday = new Date(fecha.getTime() + (daysUntilNext * 24 * 60 * 60 * 1000));
      // Ajustar la nueva fecha a la fecha del próximo día de la semana
      nextday.setDate(nextday.getDate() + (day - nextday.getDay() + 7) % 7);
      bank.push(nextday)
    }
  }
  return bank
}

function addAMonth () {
  const fecha = new Date()
  // Obtiene el mes actual
  const mesActual = fecha.getMonth()
  // Agrega un mes
  fecha.setMonth(mesActual + 1)
  // Obtiene el nuevo mes y año
  return fecha
}

exports.createReservation = async (info) => {
  try {
    let user
    let reservation
    let guarderiaService
    if (info.service_type === 'guarderia') {
      let infoArray = checkStartDay(info.guarderia_dias)
      let reservationsCreated = []
      for (let i = 0; i < infoArray.length; i++) {
        let infoToCreate = info
        infoToCreate.start_date = new Date(infoArray[i])
        reservation = await Reservations.create(infoToCreate)
        reservationsCreated.push(reservation._id)
      }

      const guarderia = {
        active: true,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: addAMonth().toISOString().slice(0, 10),
        pickUp: info.pickUp,
        guarderia_dias: info.guarderia_dias,
        guarderia_duracion: info.guarderia_duracion ?? "8 horas",
        pets: info.pets,
        client: info.client
      }
      guarderiaService = await Guarderia.create(guarderia)
      user = await User.findByIdAndUpdate(info.client, { $push: { reservations: reservationsCreated } })
    } else {
      reservation = await Reservations.create(info)
      user = await User.findByIdAndUpdate(info.client, { $push: { reservations: reservation._id } })
    }

    if (!user.address && info.address_pickup) {
      await User.findByIdAndUpdate(user._id, { address: info.address_pickup })
    }
    if (reservation.service_type === 'hotel') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Reserva Creada',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer poder informarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>
  
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
        subject: 'Reserva Creada',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer poder informarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>
  
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
      const mensaje1 = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Servicio de guarderia creado',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Es un placer informarle que se ha activado un servicio de guarderia. A continuación se incluye la información:<br><br>
  
          Número de reserva: ${reservation._id}<br>
          Inicio del servicio: ${guarderiaService.start_date.toLocaleDateString()}<br>
          Fin del servicio: ${guarderiaService.end_date.toLocaleDateString()}<br>
          Dias de guarderia: ${guarderiaService.guarderia_dias}<br>
          Duración de guarderia: ${guarderiaService.guarderia_duracion}<br>
          Pickup: ${guarderiaService.pickUp ? 'Sí' : 'No'}<br>
          Número de mascotas: ${guarderiaService.pets?.length}<br><br>
      
     Recuerde que este servicio tiene una duración de 1 mes, luego de este es necesario renovar la mensualidad para seguir usandolo.`,
          cuadro: '',
          footer: 'Gracias por confiar en nosotros.',
          alert: ''
        })
      }
  
      await sendMail(config.emailConfig, mensaje1)	
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

exports.getReservations = async () => {
  try {
    
    const count = await Reservations.count({ isActive: true })
    const reservations = await Reservations.find({ isActive: true }).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    })

    return {
      status: 'success',
      count,
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
        description: `Te escribimos para informar la cancelación de su reserva con número ${toCancel._id}<br>

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

exports.confirmReservation = async (id) => {
  try {
    const toConfirm = await Reservations.findByIdAndUpdate(id, { status: 'confirmed' }, { new: true }).populate('client', {
      name: 1,
      lastName: 1,
      email: 1
    })

    if (!toConfirm) {
      return false
    }

    if (toConfirm.service_type === 'hotel') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: toConfirm.client.email,
        subject: 'Reserva Confirmada',
        html: mailTemplate({
          title: `¡Hola ${toConfirm.client.name}!`,
          description: `Te escribimos para confirmar la reserva con número ${toConfirm._id}<br>
          Tu reserva ha sido confirmada por nuestro equipo y estamos listos para atenderle en la fecha correspondiente.<br>
  
          Si desea hacer algún cambio en su reserva, puede hacerlo dentro de la plataforma o ponerse en contacto con nosotros.<br>
  
          A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${toConfirm._id}<br>
          Tipo de servicio: ${toConfirm.service_type}<br>
          Fecha de llegada: ${toConfirm.start_date}<br>
          Fecha de salida: ${toConfirm.end_date}<br>
          Pickup: ${toConfirm.pickUp ? 'Sí' : 'No'}<br>
          ${toConfirm.pickUp ? `Dirección de recogida: ${toConfirm.address_pickup} <br>` : null}
          Número de mascotas: ${toConfirm.pets_count}<br><br>
  
          `,
          cuadro: '',
          footer: '',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }
    if (toConfirm.service_type === 'spa') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: toConfirm.client.email,
        subject: 'Reserva Confirmada',
        html: mailTemplate({
          title: `¡Hola ${toConfirm.client.name}!`,
          description: `Te escribimos para confirmar la reserva con número ${toConfirm._id}<br>
          Tu reserva ha sido confirmada por nuestro equipo y estamos listos para atenderle en la fecha correspondiente. 
  
          Si desea hacer algún cambio en su reserva, puede hacerlo dentro de la plataforma o ponerse en contacto con nosotros.<br>
  
          A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${toConfirm._id}<br>
          Tipo de servicio: ${toConfirm.service_type}<br>
          fecha de reserva: ${toConfirm.start_date}<br>
          Servicios solicitados: ${toConfirm.spa_services.join(' , ')}<br>
          Pickup: ${toConfirm.pickUp ? 'Sí' : 'No'}<br>
          ${toConfirm.pickUp ? `Dirección de recogida: ${toConfirm.address_pickup} <br>` : null}
          Número de mascotas: ${toConfirm.pets_count}<br><br>
  
          `,
          cuadro: '',
          footer: '',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }
    if (toConfirm.service_type === 'guarderia') {
      const mensaje = {
        from: process.env.EMAIL_SENDER,
        to: toConfirm.client.email,
        subject: 'Reserva Confirmada',
        html: mailTemplate({
          title: `¡Hola ${toConfirm.client.name}!`,
          description: `Te escribimos para confirmar la reserva con número ${toConfirm._id}<br>
          Tu reserva ha sido confirmada por nuestro equipo y estamos listos para atenderle en la fecha correspondiente.<br>
  
          Si desea hacer algún cambio en su reserva, puede hacerlo dentro de la plataforma o ponerse en contacto con nosotros.<br>
  
          A continuación se incluye la información de su reserva:<br><br>
  
          Número de reserva: ${toConfirm._id}<br>
          Tipo de servicio: ${toConfirm.service_type}<br>
          Dias de guarderia: ${toConfirm.guarderia_dias}<br>
          Pickup: ${toConfirm.pickUp ? 'Sí' : 'No'}<br>
          ${toConfirm.pickUp ? `Dirección de recogida: ${toConfirm.address_pickup} <br>` : null}
          Número de mascotas: ${toConfirm.pets_count}<br><br>
  
          `,
          cuadro: '',
          footer: '',
          alert: ''
        })
      }
      await sendMail(config.emailConfig, mensaje)
    }
    return {
      status: 'success',
      msg: 'Reserva confirmada con éxito'
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
