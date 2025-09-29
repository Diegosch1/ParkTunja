import * as Yup from "yup";
import mongoose from "mongoose";
import Parking from "../models/parking.model.js";

// Define Yup validation schema for input data
const parkingValidationSchema = Yup.object().shape({
  name: Yup.string().trim().max(255).required("Name is required"),
  location: Yup.string().trim().max(255).required("Location is required"),
  totalCapacity: Yup.number().min(0).required("Total capacity is required"),
  notificationThreshold: Yup.number()
    .min(0)
    .required("Notification threshold is required"),
});

export const createParking = async (req, res) => {
  const { name, location, totalCapacity, notificationThreshold } = req.body;
  try {
    await parkingValidationSchema.validate(
      { name, location, totalCapacity, notificationThreshold },
      { abortEarly: false }
    );

    const newParking = new Parking({
      name,
      location,
      totalCapacity,
      notificationThreshold,
    });
    await newParking.save();
    res.json(newParking);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: error.message });
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
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const getParking = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate the id format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }
    const foundParking = await Parking.findById(id);
    res.json(foundParking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateParking = async (req, res) => {
  const { id } = req.params;
  const { name, location, totalCapacity, notificationThreshold } = req.body;
  try {
    // Validate the id format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }

    await parkingValidationSchema.validate(
      { name, location, totalCapacity, notificationThreshold },
      { abortEarly: false }
    );

    const updatedParking = await Parking.findByIdAndUpdate(
      id,
      {
        name,
        location,
        totalCapacity,
        notificationThreshold,
      },
      { new: true }
    );
    res.json(updatedParking);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ error: error.message });
  }
};

export const deleteParking = async (req, res) => {
  const { id } = req.params;
  try {
    // Validate the id format
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ error: "Invalid parking ID format" });
    }
    const deletedParking = await Parking.findByIdAndDelete(id);
    res.json(deletedParking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
