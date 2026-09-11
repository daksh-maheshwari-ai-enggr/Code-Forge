import Message from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

const getUsers = async (req, res) => {
  try {
    const search = req.query.search?.trim();
    if (search) {
      const users = await User.find(
        { _id: { $ne: req.user.userId }, name: { $regex: search, $options: "i" } },
        { name: 1, email: 1, role: 1, avatarUrl: 1, bio: 1 },
      ).sort({ name: 1 }).limit(20);
      return res.json({ success: true, data: users });
    }

    const currentUserId = new mongoose.Types.ObjectId(req.user.userId);
    const conversationIds = await Message.aggregate([
      { $match: { $or: [{ sender: currentUserId }, { receiver: currentUserId }] } },
      { $project: { otherUser: { $cond: [{ $eq: ["$sender", currentUserId] }, "$receiver", "$sender"] }, createdAt: 1, sender: 1, receiver: 1, content: 1, read: 1 } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$otherUser", lastMessage: { $first: "$content" }, lastMessageAt: { $first: "$createdAt" }, unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$receiver", currentUserId] }, { $eq: ["$read", false] }] }, 1, 0] } } } },
      { $sort: { lastMessageAt: -1 } },
    ]);
    const userIds = conversationIds.map((item) => item._id);
    const people = await User.find({ _id: { $in: userIds } }, { name: 1, email: 1, role: 1, avatarUrl: 1, bio: 1 });
    const peopleById = new Map(people.map((person) => [String(person._id), person.toObject()]));
    const users = conversationIds.map((item) => ({ ...peopleById.get(String(item._id)), unreadCount: item.unreadCount, lastMessage: item.lastMessage, lastMessageAt: item.lastMessageAt })).filter(Boolean);

    return res.status(200).json({ success: true, data: users });
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

    const unreadIds = messages.filter((message) => String(message.receiver?._id || message.receiver) === String(currentUserId) && !message.read).map((message) => message._id);
    if (unreadIds.length) await Message.updateMany({ _id: { $in: unreadIds } }, { $set: { read: true } });
    messages.forEach((message) => { if (unreadIds.some((id) => String(id) === String(message._id))) message.read = true; });

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
