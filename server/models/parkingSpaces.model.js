import { Schema, model } from "mongoose";

const parkingSpacesSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    totalCapacity: { type: Number, required: true, min: 1 },
    availableSpots: { type: Number, required: true, min: 0 },

    // Mapa de espacios: clave = número de puesto
    spots: {
      type: Map,
      of: new Schema(
        {
          isOccupied: { type: Boolean, default: false },
          licensePlate: { type: String, trim: true },
          entryTime: { type: Date },
          exitTime: { type: Date },
        },
        { _id: false }
      ),
      default: {},
    },
  },
  { versionKey: false }
);

export default model("ParkingSpaces", parkingSpacesSchema);
