import {
  getParkings,
  getParking,
  createParking,
  deleteParking,
  updateParking,
} from "../controllers/parking.controller.js";

// Endpoint CRUD para parkings
router.get("/parking", getParkings);
router.get("/parking/:id", getParking);
router.post("/parking", createParking);
router.put("/parking/:id", updateParking);
router.delete("/parking/:id", deleteParking);
