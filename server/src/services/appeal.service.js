const Appeal = require("../models/Appeal");

const createAppeal = async (appealData) => {
  const appeal = await Appeal.create(appealData);

  return appeal;
};

const getAppealByReportId = async (reportId) => {
  const appeal = await Appeal.findOne({ report: reportId })
    .populate("appellant", "name email")
    .populate("reviewedBy", "name email");

  return appeal;
};

const getAppealById = async (appealId) => {
  const appeal = await Appeal.findById(appealId)
    .populate("appellant", "name email")
    .populate("reviewedBy", "name email");

  return appeal;
};

const updateAppealDecision = async (
  appealId,
  status,
  adminNote,
  adminId
) => {
  const appeal = await Appeal.findByIdAndUpdate(
    appealId,
    {
      status,
      adminNote,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("appellant", "name email")
    .populate("reviewedBy", "name email");

  return appeal;
};

module.exports = {
  createAppeal,
  getAppealByReportId,
  getAppealById,
  updateAppealDecision,
};