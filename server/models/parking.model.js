import { Schema, model } from "mongoose";

const parkingSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 255 },
    location: { type: String, required: true, trim: true, maxlength: 255 },
    totalCapacity: { type: Number, required: true, min: 0 },
    notificationThreshold: { type: Number, required: true, min: 0 }, // Porcentaje de ocupación maximo para notificacr
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
  ref: "FlatRate", // Reference name of the FlatRate model
  localField: "_id", // Parking ID
  foreignField: "parkingLot", // Field in FlatRate that references Parking
  justOne: false, // One-to-many relationship
});

export default model("Parking", parkingSchema);
