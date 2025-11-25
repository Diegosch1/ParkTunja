import { Router } from "express";
import {
  getFlatRates,
  getFlatRate,
  createFlatRates,
  updateFlatRates,
  deleteFlatRates,
} from "../controllers/flatRates.controller.js";

const router = Router();

// CRUD for flat ratesm
router.get("/getFlatRates", getFlatRates);
router.get("/getFlatRate/:id", getFlatRate);
router.post("/createFlatRates", createFlatRates);
router.put("/updateFlatRates", updateFlatRates);
router.delete("/deleteFlatRates/:parkingLot", deleteFlatRates);

export default router;
