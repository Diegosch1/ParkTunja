import { Schema, model } from "mongoose";

const flatRateSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    name: { type: String, required: true, trim: true, maxlength: 255 }, // Por ejemplo tarifa diaria, tarifa nocturna, etc.
    amount: { type: Number, required: true, min: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default model("FlatRate", flatRateSchema);
