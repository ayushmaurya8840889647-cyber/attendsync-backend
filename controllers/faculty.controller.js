import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import { generateQrDataUrl } from "../utils/qrGenerator.js";

// POST /api/faculty/session  -> create a new attendance session + QR
export const createSession = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can create sessions",
      });
    }

    const { course, subject, durationMinutes = 5 } = req.body;

    const expiresAt = new Date(Date.now() + Number(durationMinutes) * 60 * 1000);

    // Simple unique code: timestamp + facultyId fragment
    const sessionCode = `SES-${Date.now()}-${req.user._id.toString().slice(-6)}`;

    const session = await Session.create({
      facultyId: req.user._id,
      sessionCode,
      course,
      subject,
      expiresAt,
    });

    // Encode only what student needs to send back
    const qrPayload = { sessionCode: session.sessionCode };
    const qrCodeDataUrl = await generateQrDataUrl(qrPayload);

    res.status(201).json({
      success: true,
      session,
      qrCodeDataUrl,
    });
  } catch (err) {
    console.error("Create session error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while creating session",
    });
  }
};

// GET /api/faculty/session/:id/attendance  -> list attendance for a session
export const getSessionAttendance = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Only faculty can view session attendance",
      });
    }

    const { id } = req.params;

    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (session.facultyId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this session",
      });
    }

    const attendance = await Attendance.find({ sessionId: session._id }).populate(
      "studentId",
      "name email enrollmentNumber"
    );

    res.status(200).json({
      success: true,
      session,
      attendance,
    });
  } catch (err) {
    console.error("Get session attendance error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching session attendance",
    });
  }
};

