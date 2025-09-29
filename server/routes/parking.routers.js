import { Router } from "express";

import {
  getParkings,
  getParking,
  createParking,
  deleteParking,
  updateParking,
} from "../controllers/parking.controller.js";

const router = Router();

// CRUD for parkings
router.get("/getParkings", getParkings);
router.get("/getParking/:id", getParking);
router.post("/createParking", createParking);
router.put("/updateParking/:id", updateParking);
router.delete("/deleteParking/:id", deleteParking);

export default router;
