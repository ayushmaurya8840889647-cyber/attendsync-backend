import Session from "../models/Session.js";
import Attendance from "../models/Attendance.js";
import { getIO } from "../socket/attendance.socket.js";

export const markAttendance = async (req, res) => {
  try {
    // protect middleware attaches the logged-in user to req.user
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students can mark attendance",
      });
    }

    const { sessionCode } = req.body;

    if (!sessionCode || typeof sessionCode !== "string") {
      return res.status(400).json({
        success: false,
        message: "sessionCode is required",
      });
    }

    // Faculty encodes sessionCode in the QR; student sends it back here.
    const session = await Session.findOne({ sessionCode: sessionCode.trim() });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Invalid session code",
      });
    }

    // Reject scans after expiry or if faculty closed the session.
    if (!session.isActiveSession || !session.isActiveSession()) {
      return res.status(400).json({
        success: false,
        message: "Session is expired or not active",
      });
    }

    // Prevent duplicate marks: (studentId + sessionId) must be unique.
    const existing = await Attendance.findOne({
      studentId: req.user._id,
      sessionId: session._id,
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Attendance already marked for this session",
        attendance: existing,
      });
    }

    const attendance = await Attendance.create({
      studentId: req.user._id,
      sessionId: session._id,
      attendedAt: new Date(),
      status: "present",
    });

    // Real-time update for faculty dashboard
    try {
      const io = getIO();
      io.to(`faculty:${session.facultyId.toString()}`).emit("attendance:marked", {
        sessionId: session._id.toString(),
        studentId: req.user._id.toString(),
        attendedAt: attendance.attendedAt,
      });
      io.to(`session:${session._id.toString()}`).emit("attendance:marked", {
        sessionId: session._id.toString(),
        studentId: req.user._id.toString(),
        attendedAt: attendance.attendedAt,
      });
    } catch {
      // Socket layer is optional; don't fail the API if it's unavailable.
    }

    res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      attendance,
    });
  } catch (err) {
    // Unique index collision can still happen in race conditions.
    if (err && err.code === 11000) {
      return res.status(200).json({
        success: true,
        message: "Attendance already marked for this session",
      });
    }

    console.error("Mark attendance error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while marking attendance",
    });
  }
};

