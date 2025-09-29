import { Schema, model } from "mongoose";

const operatingHourSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    weekday: { type: Number, required: true, min: 1, max: 7 }, // 1=Monday, 7=Sunday
    openingTime: { type: String, required: true }, // formato HH:mm
    closingTime: { type: String, required: true },
  },
  { timestamps: true, versionKey: false }
);

export default model("OperatingHour", operatingHourSchema);
