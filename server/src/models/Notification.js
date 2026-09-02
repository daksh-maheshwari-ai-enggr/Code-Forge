import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    type: {
      type: String,
      enum: ["APPROVED", "REJECTED", "CHANGES_REQUESTED"],
      required: true,
    },
    reason: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    unread: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
