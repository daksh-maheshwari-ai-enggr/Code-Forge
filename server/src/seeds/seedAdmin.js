import bcrypt from "bcryptjs";
import User from "../models/User.js";

const seedAdminUser = async () => {
  try {
    const adminEmail = "admin@codeforge.com";
    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (existingAdmin) {
      console.log("Seed admin already exists.");
      return existingAdmin;
    }

    const passwordHash = await bcrypt.hash("Admin@123", 10);

    const admin = await User.create({
      name: "Admin User",
      email: adminEmail,
      password: passwordHash,
      role: "ADMIN",
      bio: "System administrator",
    });

    console.log("Seed admin created successfully:", admin.email);
    return admin;
  } catch (error) {
    console.error("Admin seeding failed:", error.message);
    return null;
  }
};

export default seedAdminUser;
