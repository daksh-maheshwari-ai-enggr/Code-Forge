require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Category = require("./models/Category");
const Article = require("./models/Article");

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set in environment or .env file");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected. Clearing database...");

    // Clear existing data
    await User.deleteMany({});
    await Category.deleteMany({});
    await Article.deleteMany({});
    console.log("Collections cleared successfully.");

    // Hashing passwords
    const adminPassword = await bcrypt.hash("Admin@123", 10);
    const authorPassword = await bcrypt.hash("Author@123", 10);

    // Create Admin
    const admin = await User.create({
      name: "Amara Silva",
      email: "amara@example.com",
      password: adminPassword,
      role: "ADMIN",
      bio: "Lead Editor and Administrator",
    });

    const backupAdmin = await User.create({
      name: "Code Forge Admin",
      email: "admin@codeforge.com",
      password: adminPassword,
      role: "ADMIN",
      bio: "System Administrator",
    });

    // Create Authors
    const priya = await User.create({
      name: "Priya Mehta",
      email: "priya@example.com",
      password: authorPassword,
      role: "AUTHOR",
      bio: "Environmental Researcher & Science Writer",
    });

    const thomas = await User.create({
      name: "Thomas Okeke",
      email: "thomas@example.com",
      password: authorPassword,
      role: "AUTHOR",
      bio: "Technology Historian & Software Engineer",
    });

    console.log("Users seeded successfully.");

    // Create Categories
    const environmentCat = await Category.create({
      name: "Environment",
      slug: "environment",
    });

    const technologyCat = await Category.create({
      name: "Technology",
      slug: "technology",
    });

    console.log("Categories seeded successfully.");

    // Create Articles
    // 1. Pending Review (Priya Mehta - Environment)
    await Article.create({
      title: "What the Ocean Is Trying to Tell Us About Carbon",
      slug: "what-the-ocean-is-trying-to-tell-us-about-carbon",
      description: "How oceans absorb and redistribute carbon.",
      content:
        "Scientists are discovering new clues about how oceans absorb and redistribute carbon, revealing a complex system that could reshape our understanding of climate change. Recent deep-sea research indicates that the rate of carbon absorption might be shifting, prompting new concerns and urgency around global ocean preservation efforts. Oceanography teams are deploying advanced marine sensors to trace these changes in real-time, aiming to refine current environmental simulation models.",
      author: priya._id,
      category: environmentCat._id,
      difficulty: "INTERMEDIATE",
      status: "PENDING_REVIEW",
      readingTimeMinutes: 8,
    });

    // 2. Changes Requested (Thomas Okeke - Technology)
    await Article.create({
      title: "The Forgotten History of the Mechanical Computer",
      slug: "the-forgotten-history-of-the-mechanical-computer",
      description: "Ingenious mechanical machines before modern computers.",
      content:
        "Long before modern computers, ingenious mechanical machines were already performing calculations. Their history tells a fascinating story of human innovation. While Babbage's Analytical Engine is well-known, earlier designs like the Antikythera mechanism demonstrate that mechanical computations date back over two thousand years. These devices utilized ornate bronze gears to model astronomical events with staggering mathematical precision, predating electron-based computing systems by generations.",
      author: thomas._id,
      category: technologyCat._id,
      difficulty: "ADVANCED",
      status: "CHANGES_REQUESTED",
      readingTimeMinutes: 7,
      feedback: "Please add more detailed explanations of the gears and mechanical math structures.",
    });

    // 3. Published 1 (Thomas Okeke - Technology)
    await Article.create({
      title: "Demystifying Quantum Computing",
      slug: "demystifying-quantum-computing",
      description: "An introduction to qubits, superposition, and quantum entanglement.",
      content:
        "Quantum computing harnesses the unique properties of quantum mechanics to solve problems too complex for classical computers. Unlike standard bits that exist as 0 or 1, qubits exist in superpositions, allowing simultaneous computation of massive datasets. This introductory guide walks you through superposition, entanglement, and the hardware engineering challenges that companies faces globally.",
      author: thomas._id,
      category: technologyCat._id,
      difficulty: "ADVANCED",
      status: "PUBLISHED",
      readingTimeMinutes: 12,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });

    // 4. Published 2 (Priya Mehta - Environment)
    await Article.create({
      title: "The Rise of Electric Vehicles",
      slug: "the-rise-of-electric-vehicles",
      description: "EV transit trends and charging infrastructure challenges.",
      content:
        "Electric vehicles have quickly transitioned from niche prototypes to mainstream transport options. This transformation is driven by breakthroughs in battery production density, charging station rollouts, and government clean emission policies. We examine the current logistics, infrastructure development bottlenecks, and environmental trade-off considerations of scaling EV deployment.",
      author: priya._id,
      category: environmentCat._id,
      difficulty: "BEGINNER",
      status: "PUBLISHED",
      readingTimeMinutes: 6,
      publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    });

    // 5. Rejected (Thomas Okeke - Technology)
    await Article.create({
      title: "Failed Tech Startup Post-Mortem",
      slug: "failed-tech-startup-post-mortem",
      description: "Why a promising startup failed despite millions raised.",
      content:
        "This post-mortem reviews the critical system and business errors that resulted in the closing of a tech startup in 2025. Main problems included poor product-market fit, premature scaling expenditures, lack of clear unit economics, and internal leadership conflicts that stalled agile pivots. Let's analyze the key takeaways.",
      author: thomas._id,
      category: technologyCat._id,
      difficulty: "INTERMEDIATE",
      status: "REJECTED",
      readingTimeMinutes: 10,
      feedback: "Content is too speculative and contains confidential details.",
    });

    console.log("Articles seeded successfully.");
    console.log("-----------------------------------------");
    console.log("SEEDED CREDENTIALS FOR TESTING:");
    console.log("Admin Email:", admin.email, " / Password: Admin@123");
    console.log("Author Email:", priya.email, " / Password: Author@123");
    console.log("-----------------------------------------");

    await mongoose.disconnect();
    console.log("Database disconnected. Seeding completed.");
  } catch (error) {
    console.error("Critical error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
