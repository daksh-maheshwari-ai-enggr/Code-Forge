const allowedRegistrationRoles = ["READER", "AUTHOR"];

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const validateRegister = (data) => {
  const { name, email, password, role, bio } = data;

  if (!name || !email || !password || !role) {
    return {
      valid: false,
      message: "Name, email, password, and role are required",
    };
  }

  if (typeof name !== "string" || !name.trim()) {
    return {
      valid: false,
      message: "Name must be a valid non-empty string",
    };
  }

  if (typeof email !== "string" || !isValidEmail(email.trim())) {
    return {
      valid: false,
      message: "Please provide a valid email address",
    };
  }

  if (typeof password !== "string" || !password.trim()) {
    return {
      valid: false,
      message: "Password must be a valid non-empty string",
    };
  }

  if (!allowedRegistrationRoles.includes(role)) {
    return {
      valid: false,
      message: "Role must be READER or AUTHOR",
    };
  }

  if (bio !== undefined && typeof bio !== "string") {
    return {
      valid: false,
      message: "Bio must be a string",
    };
  }

  return {
    valid: true,
  };
};

const validateLogin = (data) => {
  const { email, password } = data;

  if (!email || !password) {
    return {
      valid: false,
      message: "Email and password are required",
    };
  }

  if (typeof email !== "string" || !isValidEmail(email.trim())) {
    return {
      valid: false,
      message: "Please provide a valid email address",
    };
  }

  if (typeof password !== "string" || !password.trim()) {
    return {
      valid: false,
      message: "Password must be a valid non-empty string",
    };
  }

  return {
    valid: true,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  allowedRegistrationRoles,
};