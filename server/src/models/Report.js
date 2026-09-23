const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    contentType: {
      type: String,
      enum: ["ARTICLE", "COMMENT"],
      required: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    aiRiskScore: {
      type: Number,
      min: 0,
      max: 1,
      default: 0,
    },

    aiRiskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },

    status: {
      type: String,
      enum: ["OPEN", "UNDER_REVIEW", "RESOLVED", "DISMISSED"],
      default: "OPEN",
    },

    adminAction: {
      type: String,
      enum: [
        "REMOVE_CONTENT",
        "KEEP_CONTENT",
        "WARN_USER",
        "DISMISS_REPORT",
      ],
      default: null,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;