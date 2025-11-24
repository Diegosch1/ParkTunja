import * as Yup from "yup";
import mongoose from "mongoose";
import Parking from "../models/parking.model.js";
import ParkingSpaces from "../models/parkingSpaces.model.js";

const operatingHourValidationSchema = Yup.object().shape({
  weekDays: Yup.array()
    .of(Yup.number().oneOf([1, 2, 3, 4, 5, 6, 7, 8]))
    .required(),
  openingTime: Yup.string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .required(),
  closingTime: Yup.string()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .required(),
});

const parkingValidationSchema = Yup.object().shape({
  name: Yup.string().trim().max(255).required("Name is required"),
  location: Yup.string().trim().max(255).required("Location is required"),
  totalCapacity: Yup.number().min(0).required("Total capacity is required"),
  notificationThreshold: Yup.number()
    .min(0)
    .required("Notification threshold is required"),
  operatingHours: Yup.array().of(operatingHourValidationSchema),
});

const validateOperatingHoursOverlap = (operatingHours) => {
  // helper: "HH:mm" -> minutes since 00:00
  const timeToMinutes = (t) => {
    const [hh, mm] = t.split(":").map(Number);
    return hh * 60 + mm;
  };

  // build one or two intervals (in minutes) for a schedule, handling crosses-midnight
  const buildIntervals = (open, close) => {
    const o = timeToMinutes(open);
    const c = timeToMinutes(close);
    if (o === c) {
      // interpret as full day
      return [[0, 24 * 60]];
    }
    if (o < c) return [[o, c]];
    // crosses midnight: [o, 1440) and [0, c)
    return [[o, 24 * 60], [0, c]];
  };

  const intervalsOverlap = (a, b) => a[0] < b[1] && b[0] < a[1];

  const rangesOverlap = (open1, close1, open2, close2) => {
    const ints1 = buildIntervals(open1, close1);
    const ints2 = buildIntervals(open2, close2);
    for (const i1 of ints1) {
      for (const i2 of ints2) {
        if (intervalsOverlap(i1, i2)) return true;
      }
    }
    return false;
  };

  for (let i = 0; i < operatingHours.length; i++) {
    const { weekDays: daysA, openingTime: openA, closingTime: closeA } = operatingHours[i];
    for (let j = i + 1; j < operatingHours.length; j++) {
      const { weekDays: daysB, openingTime: openB, closingTime: closeB } = operatingHours[j];
      const intersection = daysA.filter((d) => daysB.includes(d));
      if (intersection.length === 0) continue;

      // if any interval overlaps (including containment), raise
      if (rangesOverlap(openA, closeA, openB, closeB)) {
        throw new Error(
          `Overlapping operating hours detected between schedules ${i + 1} and ${j + 1}. Intersecting days: ${intersection.join(", ")}`
        );
      }
    }
  }
};

export const createParking = async (req, res) => {
  const { name, location, totalCapacity, notificationThreshold, operatingHours } = req.body;
  try {
    await parkingValidationSchema.validate(
      { name, location, totalCapacity, notificationThreshold, operatingHours },
      { abortEarly: false }
    );

    if (operatingHours && operatingHours.length > 0) {
      validateOperatingHoursOverlap(operatingHours);
    }

    const newParking = new Parking({
      name,
      location,
      totalCapacity,
      notificationThreshold,
      operatingHours,
    });

    const spots = new Map();
    for (let i = 1; i <= totalCapacity; i++) {
      spots.set(i.toString(), { isOccupied: false });
    }
    await newParking.save();
    
    const newParkingSpaces = new ParkingSpaces({
      parkingLot: newParking._id,
      totalCapacity: totalCapacity,
      availableSpots: totalCapacity,
      spots: spots,
    });
    await newParkingSpaces.save();

    res.json(newParking);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const getParkings = async (req, res) => {
  try {
    const foundParkings = await Parking.find();
    res.json(
      foundParkings.map((parking) => ({
        id: parking._id,
        name: parking.name,
        location: parking.location,
        totalCapacity: parking.totalCapacity,
        notificationThreshold: parking.notificationThreshold,
        operatingHours: parking.operatingHours,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getParking = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }
    const foundParking = await Parking.findById(id).populate("flatRates");
    if (!foundParking) {
      return res.status(404).json({ error: "Parking not found" });
    }
    res.json(foundParking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateParking = async (req, res) => {
  const { id } = req.params;
  const { name, location, totalCapacity, notificationThreshold, operatingHours } = req.body;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    await parkingValidationSchema.validate(
      { name, location, totalCapacity, notificationThreshold, operatingHours },
      { abortEarly: false }
    );

    if (operatingHours && operatingHours.length > 0) {
      validateOperatingHoursOverlap(operatingHours);
    }

    const parking = await Parking.findById(id);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }

    const updatedParking = await Parking.findByIdAndUpdate(
      id,
      { name, location, totalCapacity, notificationThreshold, operatingHours },
      { new: true }
    );
    res.json(updatedParking);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(400).json({ error: error.message });
  }
};

export const deleteParking = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }
    const parking = await Parking.findById(id);
    if (!parking) {
      return res.status(404).json({ error: "Parking not found" });
    }
    const deletedParking = await Parking.findByIdAndDelete(id);
    res.json(deletedParking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
