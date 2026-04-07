import express from "express";
import { register, login, getMe } from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// POST /api/auth/register  →  Register student or faculty
router.post("/register", register);

// POST /api/auth/login  →  Login and get JWT
router.post("/login", login);

// GET /api/auth/me  →  Get logged-in user's info (protected)
router.get("/me", protect, getMe);

export default router;