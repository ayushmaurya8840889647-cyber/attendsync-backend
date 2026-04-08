import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // This is what you put inside the QR code.
    // On scan, the student sends this code back to the API.
    sessionCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    // Optional metadata (useful for display on faculty/student screens)
    course: { type: String, trim: true },
    subject: { type: String, trim: true },

    startsAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },

    status: {
      type: String,
      enum: ["active", "closed"],
      default: "active",
    },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

sessionSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

sessionSchema.methods.isActiveSession = function () {
  return this.status === "active" && !this.isExpired();
};

export default mongoose.model("Session", sessionSchema);

