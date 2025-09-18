import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import "dotenv/config";
import mongoose from "mongoose";

export const register = async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    //encrypt password
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: passwordHash,
      role,
    });
    const savedUser = await newUser.save();

    res.json({
      id: savedUser._id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid Object
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const foundUser = await User.findOne({ _id: id });

    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: foundUser._id,
      username: foundUser.username,
      email: foundUser.email,
      role: foundUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const foundUsers = await User.find();

    res.json(
      foundUsers.map((user) => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid Object
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }
    
    const { password, ...updates } = req.body;
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findOneAndUpdate({ _id: id }, updates, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(400).json({ error: "User not found" });
    }

    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if ID is a valid Object
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const foundUser = await User.findOne({ _id: id });

    if (!foundUser) return res.status(400).json({ message: "User not found" });

    await User.deleteOne({ _id: id });

    res.json({
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
