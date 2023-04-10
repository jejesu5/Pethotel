/* eslint-disable  */
const { Schema, model } = require("mongoose");

const guarderiaSchema = new Schema({
  active: {
    type: Boolean,
    default: true,
  },
  start_date: {
    type: Date,
  },
  end_date: {
    type: Date,
  },
  pickUp: {
    type: Boolean,
    default: false,
  },
  guarderia_dias: [
    {
      type: String,
      default: [],
    },
  ],
  guarderia_duracion: {
    type: String,
    default: "",
  },
  pets: [
    {
      type: Object,
      pets_type: {
        type: String,
        enum: ["perro", "gato", "otro"],
        default: "",
      },
      pets_race: {
        type: String,
        default: "",
      },
      pets_size: {
        type: String,
        enum: ["pequeño", "mediano", "grande"],
        default: "",
      },
      pets_name: {
        type: String,
        default: "",
      },
      pets_age: {
        type: String,
        default: "",
      },
      default: [],
    },
  ],
  client: {
    type: Schema.Types.ObjectId,
    ref: "User",
    },
});

const guarderia = model("guarderia", guarderiaSchema);

module.exports = guarderia;