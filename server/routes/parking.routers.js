import { Router } from "express";
import { getParking } from "../controllers/parking.controller.js";

const router = Router();

// Test endpoint
router.get("/getParking", getParking);

export default router;
