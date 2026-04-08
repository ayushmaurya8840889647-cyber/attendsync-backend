// ─── Role-Based Access Control Middleware ─────────────────────
// Usage: router.get("/route", protect, authorizeRoles("faculty"), handler)

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only ${roles.join(" or ")} can access this route.`,
      });
    }
    next();
  };
};

export { authorizeRoles };