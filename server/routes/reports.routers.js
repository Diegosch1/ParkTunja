import { Router } from "express";

import {
  getParkingReport,
//   getAllEvents,
} from "../controllers/reports.controller.js";

const router = Router();

router.get("/:parkingId/report", getParkingReport);
// router.get("/events", getAllEvents);

export default router;
