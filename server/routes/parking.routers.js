import { Router } from "express";

import {
  getParkings,
  getParking,
  createParking,
  deleteParking,
  updateParking,
} from "../controllers/parking.controller.js";

const router = Router();

// Endpoint CRUD para parkings
router.get("/", getParkings);
router.get("/:id", getParking);
router.post("/", createParking);
router.put("/:id", updateParking);
router.delete("/:id", deleteParking);

export default router;
