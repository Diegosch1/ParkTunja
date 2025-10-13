import { Router } from "express";
import {
  getFlatRates,
  getFlatRate,
  createFlatRate,
  updateFlatRate,
  deleteFlatRate,
} from "../controllers/flatRates.controller.js";

const router = Router();

// CRUD for flat rates
router.get("/getFlatRates", getFlatRates);
router.get("/getFlatRate/:id", getFlatRate);
router.post("/createFlatRate", createFlatRate);
router.put("/updateFlatRate/:id", updateFlatRate);
router.delete("/deleteFlatRate/:id", deleteFlatRate);

export default router;
