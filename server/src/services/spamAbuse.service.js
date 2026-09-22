import Comment from "../models/Comment.js";
import User from "../models/User.js";

const SPAM_THRESHOLD = 3;
const LOOKBACK_HOURS = 24;

const URL_PATTERN = /https?:\/\/[^\s]+|www\.[^\s]+/gi;

export const detectSuspiciousLink = (content) => {
  if (!content || !content.trim()) {
    return {
      containsLink: false,
      links: [],
      suspiciousLink: false,
    };
  }

  const links = content.match(URL_PATTERN) || [];

  const suspiciousLink =
    links.length > 0 &&
    links.some((link) => {
      const normalizedLink = link.toLowerCase();

      return (
        normalizedLink.includes("bit.ly/") ||
        normalizedLink.includes("tinyurl.com/") ||
        normalizedLink.includes("t.co/") ||
        normalizedLink.includes("claim") ||
        normalizedLink.includes("free") ||
        normalizedLink.includes("winner") ||
        normalizedLink.includes("prize")
      );
    });

  return {
    containsLink: links.length > 0,
    links,
    suspiciousLink,
  };
};

export const checkRepeatedSpam = async (userId) => {
  const lookbackDate = new Date(
    Date.now() - LOOKBACK_HOURS * 60 * 60 * 1000,
  );

  const spamComments = await Comment.find({
    author: userId,
    "moderation.label": { $in: ["SPAM", "SUSPICIOUS"] },
    createdAt: { $gte: lookbackDate },
  })
    .select("_id content moderation createdAt")
    .sort({ createdAt: -1 })
    .lean();

  const repeatedSpamDetected = spamComments.length >= SPAM_THRESHOLD;

  return {
    repeatedSpamDetected,
    spamCount: spamComments.length,
    threshold: SPAM_THRESHOLD,
    lookbackHours: LOOKBACK_HOURS,
  };
};

export const restrictUserIfNeeded = async (userId, spamCount) => {
  if (spamCount < SPAM_THRESHOLD) {
    return {
      accountRestricted: false,
      restrictionReason: "",
    };
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      isRestricted: true,
      restrictionReason: "Repeated spam or suspicious activity detected",
      restrictedAt: new Date(),
    },
    {
      new: true,
    },
  ).select("isRestricted restrictionReason restrictedAt");

  if (!user) {
    throw new Error("User not found while applying account restriction");
  }

  return {
    accountRestricted: user.isRestricted,
    restrictionReason: user.restrictionReason,
    restrictedAt: user.restrictedAt,
  };
};