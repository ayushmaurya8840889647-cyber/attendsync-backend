import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ─── Helper: Generate JWT ─────────────────────────────────────
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

// ─── Helper: Send token response ─────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id, user.role);

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...(user.role === "student" && { enrollmentNumber: user.enrollmentNumber }),
      ...(user.role === "faculty" && {
        department: user.department,
        employeeId: user.employeeId,
      }),
    },
  });
};

// ────────────────────────────────────────────────────────────────
// @desc    Register a new user (student or faculty)
// @route   POST /api/auth/register
// @access  Public
// ────────────────────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, role, enrollmentNumber, department, employeeId } = req.body;

    // 1. Basic field validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "Please provide name, email, password, and role",
      });
    }

    // 2. Role must be valid
    if (!["student", "faculty"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role must be either 'student' or 'faculty'",
      });
    }

    // 3. Role-specific field validation
    if (role === "student" && !enrollmentNumber) {
      return res.status(400).json({
        success: false,
        message: "Enrollment number is required for students",
      });
    }

    if (role === "faculty" && (!department || !employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Department and Employee ID are required for faculty",
      });
    }

    // 4. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    // 5. Create the user
    const user = await User.create({
      name,
      email,
      password,
      role,
      ...(role === "student" && { enrollmentNumber }),
      ...(role === "faculty" && { department, employeeId }),
    });

    // 6. Respond with token
    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

// ────────────────────────────────────────────────────────────────
// @desc    Login user (student or faculty)
// @route   POST /api/auth/login
// @access  Public
// ────────────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // 2. Find user (include password since select: false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Compare passwords
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4. Respond with token
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error("Login Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};

// ────────────────────────────────────────────────────────────────
// @desc    Get currently logged-in user
// @route   GET /api/auth/me
// @access  Private
// ────────────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    // req.user is set by the auth middleware
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GetMe Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error fetching user",
    });
  }
};