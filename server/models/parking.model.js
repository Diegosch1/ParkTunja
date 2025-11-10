import { Schema, model } from "mongoose";
import { operatingHourSchema } from "./operatingHour.model.js";

const parkingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    location: { type: String, required: true, trim: true, maxlength: 255 },
    totalCapacity: { type: Number, required: true, min: 0 },
    notificationThreshold: { type: Number, required: true, min: 0 }, // Porcentaje de ocupación máximo para notificar
   
    operatingHours: {
      type: [operatingHourSchema],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: "Debe haber al menos un horario configurado",
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    id: false,
  }
);

// Virtual field to populate flat rates
parkingSchema.virtual("flatRates", {
  ref: "FlatRate",
  localField: "_id",
  foreignField: "parkingLot",
  justOne: false,
});

export default model("Parking", parkingSchema);
