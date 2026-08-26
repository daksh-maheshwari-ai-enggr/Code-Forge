import dotenv from "dotenv"
dotenv.config();

import express from "express"
import cors from "cors"
import connectDB from "./src/config/db.js"
import authRoutes from "./src/routes/auth.routes.js"

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Code Forge API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();