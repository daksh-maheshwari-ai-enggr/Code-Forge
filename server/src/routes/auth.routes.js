import express from "express"

const {
  register,
  login,
  getMe,
} = require("../controllers/auth.controller");

const {
  validateRegister,
  validateLogin,
} = require("../validators/auth.validator");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", (req, res, next) => {
  const validation = validateRegister(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: validation.message,
      },
    });
  }

  next();
}, register);

router.post("/login", (req, res, next) => {
  const validation = validateLogin(req.body);

  if (!validation.valid) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_INPUT",
        message: validation.message,
      },
    });
  }

  next();
}, login);

router.get("/me", authMiddleware, getMe);

export default router;