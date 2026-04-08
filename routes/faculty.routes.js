import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { createSession, getSessionAttendance } from "../controllers/faculty.controller.js";

const router = express.Router();

// Faculty creates a new attendance session and receives QR code
router.post(
  "/session",
  protect,
  authorizeRoles("faculty"),
  createSession
);

// Faculty views attendance for a session
router.get(
  "/session/:id/attendance",
  protect,
  authorizeRoles("faculty"),
  getSessionAttendance
);

export default router;

