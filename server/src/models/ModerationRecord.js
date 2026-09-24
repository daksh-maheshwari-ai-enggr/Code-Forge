import mongoose from "mongoose";

const moderationRecordSchema = new mongoose.Schema(
  {
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["Article", "Comment"],
      default: "Article",
    },
    // AI Output
    riskScore: {
      type: Number,
      default: 0,
    },
    severity: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
    },
    categories: {
      type: [String],
      default: [],
    },
    aiReason: {
      type: String,
    },
    aiRecommendation: {
      type: String,
      enum: ["APPROVE", "REVIEW", "BLOCK"],
    },
    aiConfidence: {
      type: Number,
    },
    modelProvider: {
      type: String,
    },
    // Workflow State
    status: {
      type: String,
      enum: ["PENDING", "RESOLVED"],
      default: "PENDING",
    },
    // Human Resolution
    finalDecision: {
      type: String,
      enum: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
    },
    adminNotes: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ModerationRecord", moderationRecordSchema);
