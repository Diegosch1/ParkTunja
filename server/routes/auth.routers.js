import { Router } from "express";
import {
  login,
  logout,
  verifyToken,
} from "../controllers/auth.controller.js";

import {
  register,
  getUser,
  getAllUsers,
  updateUser,
  deleteUser,
} from "../controllers/admin.controller.js";
import { authRequired, adminRequired } from "../middlewares/validateToken.js";

const router = Router();

// User routes
router.post("/login", login);
router.post("/logout", logout);

// Verify token route
router.get("/verify", verifyToken);

// Admin routes
router.post("/register", adminRequired, register);
router.get("/getUser/:id", adminRequired, getUser);
router.get("/getAllUsers", adminRequired, getAllUsers);
router.put("/updateUser/:id", adminRequired, updateUser);
router.delete("/deleteUser/:id", adminRequired, deleteUser);

export default router;
