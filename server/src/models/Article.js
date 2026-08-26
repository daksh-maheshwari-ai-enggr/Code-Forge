import mongoose from "mongoose";

const articleSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    tags: {
      type: [String],
      default: [],
    },

    content: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "PENDING_REVIEW",
        "CHANGES_REQUESTED",
        "APPROVED",
        "PUBLISHED",
        "REJECTED",
      ],
      default: "DRAFT",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Article", articleSchema);