import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./src/config/db.js";
import seedAdminUser from "./src/seeds/seedAdmin.js";

import authRoutes from "./src/routes/auth.routes.js";
import articleRoutes from "./src/routes/article.routes.js";
import notificationRoutes from "./src/routes/notification.routes.js";
import quizRoutes from "./src/routes/quiz.routes.js";
import chatRoutes from "./src/routes/chat.routes.js";

import registerChatSocket from "./src/socket/chat.socket.js";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
  },
});

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Code Forge API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api", quizRoutes);
app.use("/api/chat", chatRoutes);

// Register WebSocket chat events.
registerChatSocket(io);

const PORT = process.env.PORT || 5004;

const startServer = async () => {
  try {
    await connectDB();
    await seedAdminUser();

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();