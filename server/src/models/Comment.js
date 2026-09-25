import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    context: {
      type: String,
      enum: ["ARTICLE", "QUIZ"],
      default: "ARTICLE",
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    moderation: {
      label: {
        type: String,
        enum: ["NORMAL", "SPAM", "ABUSIVE", "SUSPICIOUS", "UNKNOWN"],
        default: "UNKNOWN",
      },
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },
      reason: {
        type: String,
        default: "",
        trim: true,
      },
      checkedAt: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true },
);

commentSchema.index({ article: 1, context: 1, parent: 1, createdAt: -1 });
commentSchema.index({ author: 1, "moderation.label": 1, createdAt: -1 });

export default mongoose.model("Comment", commentSchema);