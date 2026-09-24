import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
    },
    actorType: {
      type: String,
      enum: ["USER", "ADMIN", "SYSTEM_AI"],
      required: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    targetType: {
      type: String,
      required: true,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("AuditLog", auditLogSchema);
