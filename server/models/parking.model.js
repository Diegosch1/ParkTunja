import { Schema, model } from "mongoose";

const parkingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    location: { type: String, required: true, trim: true, maxlength: 255 },
    totalCapacity: { type: Number, required: true, min: 0 },
    notificationThreshold: { type: Number, required: true, min: 0 }, // Porcentaje de ocupación maximo para notificacr
  },
  { timestamps: true, versionKey: false }
);

export default model("Parking", parkingSchema);
