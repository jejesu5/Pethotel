const { Schema, model } = require('mongoose')

const reservationSchema = new Schema({
  service_type: {
    type: String,
    enum: ['hotel', 'spa', 'guarderia']
  },
  status: {
    type: String,
    enum: ['pending', 'canceled', 'on progress', 'completed']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  pickUp: {
    type: Boolean,
    default: false
  },
  guarderia_dias: [{
    type: String,
    default: []
  }],
  guarderia_duracion: {
    type: String,
    default: ''
  },
  pets_count: {
    type: String,
    default: ''
  },
  pets: [{
    type: Object,
    pets_type: {
      type: String,
      enum: ['perro', 'gato', 'otro'],
      default: ''
    },
    pets_race: {
      type: String,
      default: ''
    },
    pets_size: {
      type: String,
      enum: ['pequeño', 'mediano', 'grande'],
      default: ''
    },
    pets_name: {
      type: String,
      default: ''
    },
    pets_age: {
      type: String,
      default: ''
    },
    default: []
  }],
  address_pickup: {
    type: String,
    default: ''
  },
  spa_services: {
    type: String,
    enum: ['peluqueria', 'baño basico', 'baño especial', 'corte de uñas', 'baño de oidos', 'enjuague bucal']
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

const reservations = model('reservations', reservationSchema)

module.exports = reservations
