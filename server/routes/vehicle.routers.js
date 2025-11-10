import { Router } from "express";
import {
  registerVehicleEntry,
  registerVehicleExit,
//   calculateVehicleFee,
  getParkingSpacesInfo,  
} from "../controllers/parkingSpaces.controller.js";

const router = Router();

// CRUD for vehicle parking operations
router.get("/getParkingInfo/:parkingId", getParkingSpacesInfo);
router.post("/vehicleEntry/:parkingId", registerVehicleEntry);
router.post("/vehicleExit/:parkingId", registerVehicleExit);

export default router;
