require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not loaded from .env");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@codeforge.com";
    const password = "Admin@123";

    let user = await User.findOne({ email });

    if (user) {
      user.role = "ADMIN";
      user.password = await bcrypt.hash(password, 10);
      await user.save();

      console.log("Existing user converted to ADMIN.");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await User.create({
        name: "Code Forge Admin",
        email,
        password: hashedPassword,
        role: "ADMIN",
        bio: "Code Forge Administrator",
      });

      console.log("Admin account created successfully.");
    }

    console.log("--------------------------------");
    console.log("ADMIN LOGIN");
    console.log("Email:", email);
    console.log("Password:", password);
    console.log("--------------------------------");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();