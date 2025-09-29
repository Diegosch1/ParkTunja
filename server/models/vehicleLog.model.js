import { Schema, model } from "mongoose";

const vehicleLogSchema = new Schema(
  {
    parkingLot: { type: Schema.Types.ObjectId, ref: "Parking", required: true },
    licensePlate: { type: String, required: true, trim: true, maxlength: 20 },
    entryTime: { type: Date, required: true },
    exitTime: { type: Date },
    calculatedFee: { type: Number, min: 0 },
    // operator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { versionKey: false }
);

export default model("VehicleLog", vehicleLogSchema);
