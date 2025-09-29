import { Router } from "express";

import {
  register,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";
import { adminRequired } from "../middlewares/validateToken.js";

const router = Router();

// Admin routes
router.post("/register", adminRequired, register);
router.get("/getUser/:id", adminRequired, getUser);
router.get("/getAllUsers",adminRequired , getAllUsers);
router.put("/updateUser/:id", adminRequired, updateUser);
router.delete("/deleteUser/:id", adminRequired, deleteUser);

export default router;
