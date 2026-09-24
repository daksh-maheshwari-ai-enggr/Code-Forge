const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "Access denied. Admin privileges required.",
        },
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Error verifying admin privileges",
      },
    });
  }
};

export default adminMiddleware;
