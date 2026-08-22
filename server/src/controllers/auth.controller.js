const {
  registerUser,
  loginUser,
  getCurrentUser,
} = require("../services/auth.service");

const register = async (req, res) => {
  try {
    const result = await registerUser(req.body);

    return res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Register error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.statusCode === 409 ? "EMAIL_EXISTS" : "REGISTER_ERROR",
        message: error.message || "Registration failed",
      },
    });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.statusCode === 401 ? "INVALID_CREDENTIALS" : "LOGIN_ERROR",
        message: error.message || "Login failed",
      },
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.userId);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Get current user error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      error: {
        code: error.statusCode === 404 ? "USER_NOT_FOUND" : "GET_USER_ERROR",
        message: error.message || "Unable to get current user",
      },
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};