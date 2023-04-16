/* eslint-disable  */
const db = require("../database/models/db.models");
const Reservation = db.reservations;
const Guarderia = db.guarderia;
const User = db.user;
const mailTemplate = require("./mailTemplate")
const sendMail = require("./sendmail")

exports.endGuarderiaService = async () => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(today); // Copia de la fecha actual
tomorrow.setDate(today.getDate() + 1); // Suma 1 día a la fecha actual
const tomorrowISO = tomorrow.toISOString().slice(0, 10);

  let guarderia = await Guarderia.find({
    "end_date" : {"$gte": new Date(today),
              "$lt": new Date(tomorrowISO)}
  });

    for (let i = 0; i < guarderia.length; i++) {
       let findGuarderia = await Guarderia.findByIdAndUpdate(guarderia[i]._id, { active: false });
       let user = await User.findById(findGuarderia.client);
       const mensaje1 = {
        from: process.env.EMAIL_SENDER,
        to: user.email,
        subject: 'Servicio de guarderia finalizado',
        html: mailTemplate({
          title: `¡Hola ${user.name}!`,
          description: `Tu servicio de guarderia mensual ha finalizado, te agradecemos que hayas confiado en nosotros y esperamos que tu experiencia haya sido sastifactoria<br><br>
          Si quieres renovar tu servicio de guarderia, contactanos`,
          cuadro: '',
          footer: 'Gracias por confiar en nosotros.',
          alert: ''
        })
      }
  
      await sendMail(config.emailConfig, mensaje1)	
    }

  console.log("Guarderia service ended");
};

exports.checkDayReservation = async () => {
    let today = new Date().getDay();
    let days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    let day = days[today];
    let fecha = new Date().toISOString().slice(0, 10);
    const tomorrow = new Date(fecha); // Copia de la fecha actual
tomorrow.setDate(fecha.getDate() + 1); // Suma 1 día a la fecha actual
const tomorrowISO = tomorrow.toISOString().slice(0, 10);

    let guarderia = await Guarderia.find({ active: true, guarderia_dias: {$in: [day]} });

    for (let i = 0; i < guarderia.length; i++) {
        let reservations = await Reservation.find({ client: guarderia[i].client, service_type: 'guarderia', start_date: {$gte: new Date(fecha), $lt: new Date(tomorrowISO)} });

        let user = await User.findById(guarderia[i].client);

        if (reservations.length < 1) {
            await Reservation.create({
                service_type: 'guarderia',
                start_date: new Date(),
                end_date: new Date(),
                client: guarderia[i].client,
                pets: guarderia[i].pets,
                pets_count: guarderia[i].pets.length,
                pickUp: guarderia[i].pickUp,
        });

        const mensaje1 = {
          from: process.env.EMAIL_SENDER,
          to: user.email,
          subject: 'Servicio de guarderia creado',
          html: mailTemplate({
            title: `¡Hola ${user.name}!`,
            description: `Te recordamos que tienes un servicio de guarderia pendiente:<br><br>
    
            Número de reserva: ${reservations._id}<br>
            Inicio del servicio: ${reservations.start_date.toLocaleDateString()}<br>
            Fin del servicio: ${reservations.end_date.toLocaleDateString()}<br>
            Pickup: ${reservations.pickUp ? 'Sí' : 'No'}<br>
            Número de mascotas: ${reservations.pets?.length}<br><br>
        
            Si tienes alguna duda, contactanos`,
            cuadro: '',
            footer: 'Gracias por confiar en nosotros.',
            alert: ''
          })
        }
    
        await sendMail(config.emailConfig, mensaje1)	
        console.log ('Reservation created for ' + guarderia[i].client)
    }
};
}

