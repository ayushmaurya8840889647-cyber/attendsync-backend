import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { markAttendance } from "../controllers/student.controller.js";

const router = express.Router();

// POST /api/student/attend -> mark attendance by scanning QR sessionCode
router.post("/attend", protect, markAttendance);

export default router;

