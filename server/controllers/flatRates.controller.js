import * as Yup from "yup";
import mongoose from "mongoose";
import FlatRate from "../models/flatRates.model.js";
import Parking from "../models/parking.model.js";

// Define Yup validation schema for input data
const flatRateValidationSchema = Yup.object().shape({
  parkingLot: Yup.string().trim().max(255).required("Parking lot is required"),
  name: Yup.string().trim().max(255).required("Name is required"),
  amount: Yup.number().min(0).required("Amount is required"),
});

// Validate ObjectId format
export const validateObjectId = (id, fieldName) => {
  if (!mongoose.isValidObjectId(id)) {
    throw new Error(`Invalid ${fieldName} ID format`);
  }
};

// Check if parking lot exists
export const validateParkingExists = async (parkingLot) => {
  const parking = await Parking.findById(parkingLot);
  if (!parking) {
    throw new Error("Parking lot does not exist");
  }
};

// Check if flat rate exists
export const validateFlatRateExists = async (id) => {
  const flatRate = await FlatRate.findById(id);
  if (!flatRate) {
    throw new Error("Flat rate not found");
  }
};

export const createFlatRate = async (req, res) => {
  const { parkingLot, name, amount } = req.body;

  try {
    await flatRateValidationSchema.validate(
      { parkingLot, name, amount },
      { abortEarly: false }
    );

    validateObjectId(parkingLot, "parking lot");
    await validateParkingExists(parkingLot);

    const newFlatRate = await FlatRate.create({ parkingLot, name, amount });

    res.status(201).json(newFlatRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getFlatRates = async (req, res) => {
  try {
    const flatRates = await FlatRate.find();
    res.json(flatRates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlatRate = async (req, res) => {
  const { id } = req.params;
  try {
    validateObjectId(id, "flat rate");
    const flatRate = await FlatRate.findById(id);
    res.json(flatRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateFlatRate = async (req, res) => {
  const { id } = req.params;
  const { parkingLot, name, amount } = req.body;

  try {
    await flatRateValidationSchema.validate(
      { parkingLot, name, amount },
      { abortEarly: false }
    );

    validateObjectId(id, "flat rate");
    validateObjectId(parkingLot, "parking lot");
    await validateParkingExists(parkingLot);
    await validateFlatRateExists(id);

    const updatedFlatRate = await FlatRate.findByIdAndUpdate(
      id,
      { parkingLot, name, amount },
      { new: true }
    );
    res.json(updatedFlatRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteFlatRate = async (req, res) => {
  const { id } = req.params;
  try {
    validateObjectId(id, "flat rate");
    await validateFlatRateExists(id);

    const deletedFlatRate = await FlatRate.findByIdAndDelete(id);
    res.json(deletedFlatRate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
