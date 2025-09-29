import { Router } from "express";
import {
  getParkings,
  getParking,
  createParking,
  deleteParking,
  updateParking,
} from "../controllers/parking.controller.js";

const router = Router();

// Endpoint de prueba
router.get("/", (req, res) => {
  res.json({ message: "Node server running" });
});

// Endpoint de prueba
router.get("/parking", getParkings);
router.get("/parking/:id", getParking);
router.post("/parking", createParking);
router.put("/parking/:id", updateParking);
router.delete("/parking/:id", deleteParking);

export default router;
