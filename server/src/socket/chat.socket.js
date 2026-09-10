import jwt from "jsonwebtoken";
import Message from "../models/Message.js";

export default function registerChatSocket(io) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Authentication token is required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.userId;
      socket.role = decoded.role;

      next();
    } catch (error) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Chat socket connected: ${socket.userId}`);

    // Each user gets a private room based on their user ID.
    socket.join(`user:${socket.userId}`);

    socket.on("send_message", async (payload, callback) => {
      try {
        const { receiverId, content } = payload || {};

        if (!receiverId || !content?.trim()) {
          return callback?.({
            success: false,
            message: "Receiver and message content are required",
          });
        }

        const message = await Message.create({
          sender: socket.userId,
          receiver: receiverId,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id)
          .populate("sender", "name avatarUrl")
          .populate("receiver", "name avatarUrl");

        const messageData = populatedMessage.toObject();

        // Send to receiver immediately.
        io.to(`user:${receiverId}`).emit(
          "new_message",
          messageData
        );

        // Send back to sender so both sides stay in sync.
        io.to(`user:${socket.userId}`).emit(
          "message_sent",
          messageData
        );

        callback?.({
          success: true,
          data: messageData,
        });
      } catch (error) {
        console.error("Socket send message error:", error.message);

        callback?.({
          success: false,
          message: "Unable to send message",
        });
      }
    });

    socket.on("mark_messages_read", async (payload, callback) => {
      try {
        const { senderId } = payload || {};

        if (!senderId) {
          return callback?.({
            success: false,
            message: "Sender ID is required",
          });
        }

        await Message.updateMany(
          {
            sender: senderId,
            receiver: socket.userId,
            read: false,
          },
          {
            $set: { read: true },
          }
        );

        callback?.({
          success: true,
        });
      } catch (error) {
        console.error("Mark messages read error:", error.message);

        callback?.({
          success: false,
          message: "Unable to mark messages as read",
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Chat socket disconnected: ${socket.userId}`);
    });
  });
}