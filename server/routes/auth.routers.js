import { Router } from "express";
import { getParking } from "../controllers/parking.controller.js";

const router = Router();

// Endpoint de prueba
router.get("/", (req, res) => {
  res.json({ message: "Node server running" });
});

// Endpoint de prueba
router.get("/parking", getParking);

export default router;
