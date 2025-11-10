import { Schema, model } from "mongoose";

export const operatingHourSchema = new Schema(
  {    
    weekDays: {
      type: [Number],
      required: true,
      enum: [1, 2, 3, 4, 5, 6, 7, 8], // 1=Monday, 7=Sunday, 8=Holyday
      validate: {
        validator: (v) => v.length > 0,
        message: "There must be at least one day in weekDays array.",
      }
    },
    openingTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // validates format HH:mm (00:00 - 23:59)
    },
    closingTime: {
      type: String,
      required: true,
      match: /^([0-1]\d|2[0-3]):([0-5]\d)$/, // validates format HH:mm (00:00 - 23:59)
    },
  },
  { timestamps: true, versionKey: false }
);

export const OperatingHour = model("OperatingHour", operatingHourSchema);
