import Article from "../models/Article.js";
import Subscription from "../models/Subscription.js";
import User from "../models/User.js";

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  avatarUrl: user.avatarUrl,
  bio: user.bio,
  role: user.role,
  createdAt: user.createdAt,
});

export const getPublicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const articles = await Article.find({ author: user._id, status: "PUBLISHED" }).sort({ createdAt: -1 });
    const subscriberCount = await Subscription.countDocuments({ author: user._id });
    res.json({ success: true, data: { user: publicUser(user), articles, subscriberCount } });
  } catch (error) {
    next(error);
  }
};

export const subscribe = async (req, res, next) => {
  try {
    if (String(req.user.userId) === req.params.id) {
      return res.status(400).json({ success: false, message: "You cannot subscribe to yourself" });
    }
    const author = await User.findById(req.params.id);
    if (!author) return res.status(404).json({ success: false, message: "User not found" });

    await Subscription.findOneAndUpdate(
      { subscriber: req.user.userId, author: author._id },
      { $setOnInsert: { subscriber: req.user.userId, author: author._id } },
      { upsert: true, new: true },
    );
    res.json({ success: true, data: { subscribed: true } });
  } catch (error) {
    next(error);
  }
};

export const unsubscribe = async (req, res, next) => {
  try {
    await Subscription.deleteOne({ subscriber: req.user.userId, author: req.params.id });
    res.json({ success: true, data: { subscribed: false } });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatus = async (req, res, next) => {
  try {
    const subscription = await Subscription.exists({ subscriber: req.user.userId, author: req.params.id });
    res.json({ success: true, data: { subscribed: Boolean(subscription) } });
  } catch (error) {
    next(error);
  }
};
