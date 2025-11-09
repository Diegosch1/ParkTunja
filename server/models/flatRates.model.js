import { Schema, model } from "mongoose";
import { operatingHourSchema } from "./operatingHour.model.js";

const flatRateSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    amount: { type: Number, required: true, min: 0 },
    operatingHour: { type: operatingHourSchema, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default model("FlatRate", flatRateSchema);
