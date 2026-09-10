import Message from "../models/Message.js";
import User from "../models/User.js";

const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.user.userId } },
      {
        name: 1,
        email: 1,
        role: 1,
        avatarUrl: 1,
        bio: 1,
      }
    ).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get chat users error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        code: "GET_CHAT_USERS_ERROR",
        message: "Unable to load users",
      },
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const otherUserId = req.params.userId;

    const otherUser = await User.findById(otherUserId, {
      name: 1,
      email: 1,
      role: 1,
      avatarUrl: 1,
      bio: 1,
    });

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    const messages = await Message.find({
      $or: [
        {
          sender: currentUserId,
          receiver: otherUserId,
        },
        {
          sender: otherUserId,
          receiver: currentUserId,
        },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name avatarUrl")
      .populate("receiver", "name avatarUrl");

    return res.status(200).json({
      success: true,
      data: {
        user: otherUser,
        messages,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        code: "GET_MESSAGES_ERROR",
        message: "Unable to load messages",
      },
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { receiverId, content } = req.body;

    if (!receiverId || !content?.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_MESSAGE",
          message: "Receiver and message content are required",
        },
      });
    }

    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "Receiver not found",
        },
      });
    }

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      content: content.trim(),
    });

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name avatarUrl")
      .populate("receiver", "name avatarUrl");

    return res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error.message);

    return res.status(500).json({
      success: false,
      error: {
        code: "SEND_MESSAGE_ERROR",
        message: "Unable to send message",
      },
    });
  }
};

export {
  getUsers,
  getMessages,
  sendMessage,
};