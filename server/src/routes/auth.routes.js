import express from "express"

import  {
  register,
  login,
  getMe,
} from "../controllers/auth.controller.js";

import  {
  validateRegister,
  validateLogin,
} from "../validators/auth.validator.js";

import  authMiddleware from "../middleware/auth.middleware.js";

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