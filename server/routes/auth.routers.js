import { Router } from "express";
import {
  login,
  logout,
  verifyToken,
} from "../controllers/auth.controller.js";

const router = Router();

// User routes
router.post("/login", login);
router.post("/logout", logout);

// Verify token route
router.get("/verify", verifyToken);

export default router;
