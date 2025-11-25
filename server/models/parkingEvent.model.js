import { Schema, model } from "mongoose";

const parkingEventSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    spotNumber: { type: Number, required: true },
    licensePlate: { type: String, required: true },

    type: {
      type: String,
      enum: ["entry", "exit"],
      required: true,
    },

    timestamp: { type: Date, required: true },
    fee: { type: Number }, // solo para eventos de salida
    durationHours: { type: Number }, // solo salidas
  },
  { timestamps: false, versionKey: false }
);

export default model("ParkingEvent", parkingEventSchema);
