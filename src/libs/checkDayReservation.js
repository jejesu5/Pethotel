/* eslint-disable  */
const db = require("../database/models/db.models");
const Reservation = db.reservations;
const Guarderia = db.guarderia;

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
       await Guarderia.findByIdAndUpdate(guarderia[i]._id, { active: false });
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
        console.log ('Reservation created for ' + guarderia[i].client)
    }
};
}

