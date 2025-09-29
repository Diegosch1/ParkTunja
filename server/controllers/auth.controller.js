import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";
import 'dotenv/config';
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
    const { email, password } = req.body

    try {

        const foundUser = await User.findOne({ email })
        if (!foundUser) return res.status(400).json({ message: "User not found" });

        const passwordMatches = await bcrypt.compare(password, foundUser.password)

        if (!passwordMatches) return res.status(400).json({ message: "Invalid credentials" });

        const token = await createAccessToken({ id: foundUser._id, role: foundUser.role });

        res.cookie("token", token);
        res.json(
            {
                id: foundUser._id,
                username: foundUser.username,
                email: foundUser.email,
                role: foundUser.role
            }
        )

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', {
        expires: new Date(0)
    })
    return res.sendStatus(200);
};

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401).json({ message: "Unauthorized" });

        const userFound = await User.findById(user.id);
        if (!userFound) return res.status(401).json({ message: "Unauthorized" });

        return res.json({
            id: userFound.id,
            username: userFound.username,
            email: userFound.email,
            role: userFound.role
        })
    })
}