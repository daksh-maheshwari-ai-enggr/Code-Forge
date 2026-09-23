const Report = require("../models/Report");

const createReport = async (reportData) => {
  const report = await Report.create(reportData);

  return report;
};

const getAllReports = async () => {
  const reports = await Report.find()
    .populate("reporter", "name email")
    .populate("reportedUser", "name email")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  return reports;
};

const getReportById = async (reportId) => {
  const report = await Report.findById(reportId)
    .populate("reporter", "name email")
    .populate("reportedUser", "name email")
    .populate("reviewedBy", "name email");

  return report;
};

const updateReportAction = async (
  reportId,
  adminAction,
  adminId
) => {
  const status =
    adminAction === "DISMISS_REPORT"
      ? "DISMISSED"
      : "RESOLVED";

  const report = await Report.findByIdAndUpdate(
    reportId,
    {
      adminAction,
      status,
      reviewedBy: adminId,
      reviewedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );

  return report;
};

module.exports = {
  createReport,
  getAllReports,
  getReportById,
  updateReportAction,
};