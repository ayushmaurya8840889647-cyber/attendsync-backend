import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
      required: true,
      index: true,
    },

    // Required by the flow: store when attendance was marked.
    attendedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // Optional status field for future enhancements (edit/late/cancel etc.)
    status: {
      type: String,
      enum: ["present", "absent", "late"],
      default: "present",
    },
  },
  { timestamps: true }
);

// Prevent a student from marking the same session multiple times.
attendanceSchema.index({ studentId: 1, sessionId: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);

