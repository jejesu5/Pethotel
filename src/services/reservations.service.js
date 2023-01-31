const db = require('../database/models/db.models')
const Reservations = db.reservations
const User = db.user
const mailTemplate = require('../libs/mailTemplate')
const sendMail = require('../libs/sendmail')
const config = require('../libs/config')

exports.createReservation = async (req, res) => {
  try {
    const info = req.body
    const { user } = req.body

    const reservation = await Reservations.create(info)

    if (!user.address && info.address_pickup) {
      await User.findByIdAndUpdate(user._id, { address: info.address_pickup })
    }
    const mensaje = {
      from: process.env.EMAIL_SENDER,
      to: user.email,
      subject: 'Confirmación de Reserva',
      html: mailTemplate({
        title: `¡Hola ${user.name}!`,
        description: `Es un placer poder confirmarle que su reserva ha sido creada con éxito. A continuación se incluye la información de su reserva:<br><br>

        Número de reserva: ${reservation._id}<br>
        Fecha de llegada: ${reservation.start_date}<br>
        Fecha de salida: ${reservation.end_date}<br>
        Pickup: ${reservation.pickUp ? 'Sí' : 'No'}<br>
        ${reservation.pickUp ? `Dirección de recogida: ${reservation.address_pickup} <br>` : null}
        Número de mascotas: ${reservation.pets_count}<br><br>
    
    Si tiene alguna pregunta o necesita hacer algún cambio en su reserva, por favor no dude en ponerse en contacto con nosotros. Estamos a su disposición para ayudarle en lo que necesite.`,
        cuadro: '',
        footer: 'mas perritoooos!!!!',
        alert: ''
      })
    }
    await sendMail(config.emailConfig, mensaje)

    return res.send({
      status: 'success',
      data: reservation
    })
  } catch (error) {
    throw new Error(error)
  }
}
