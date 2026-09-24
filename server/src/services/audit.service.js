import AuditLog from "../models/AuditLog.js";

export const logAuditEvent = async ({
  action,
  actorType,
  actorId = null,
  targetId,
  targetType,
  details = {},
}) => {
  try {
    const log = new AuditLog({
      action,
      actorType,
      actorId,
      targetId,
      targetType,
      details,
    });
    await log.save();
    return log;
  } catch (error) {
    console.error("Failed to save audit log:", error);
    // Avoid crashing the main process if audit logging fails
  }
};

export const getAuditLogsService = async (page = 1, limit = 50) => {
  const skip = (page - 1) * limit;
  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("actorId", "name email")
    .exec();
    
  const total = await AuditLog.countDocuments();
  return { logs, total, page, limit };
};
