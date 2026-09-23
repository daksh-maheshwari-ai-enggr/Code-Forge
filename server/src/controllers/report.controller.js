const {
  createReport,
  getAllReports,
  getReportById,
  updateReportAction,
} = require("../services/report.service");

// Create a new report
const create = async (req, res) => {
  try {
    const report = await createReport({
      ...req.body,
      reporter: req.user.userId,
    });

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "CREATE_REPORT_FAILED",
        message: error.message,
      },
    });
  }
};

// Get all reports
const getAll = async (req, res) => {
  try {
    const reports = await getAllReports();

    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_REPORTS_FAILED",
        message: error.message,
      },
    });
  }
};

// Get one report by ID
const getOne = async (req, res) => {
  try {
    const report = await getReportById(req.params.reportId);

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REPORT_NOT_FOUND",
          message: "Report not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_REPORT_FAILED",
        message: error.message,
      },
    });
  }
};

// Update admin action on a report
const updateAction = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { adminAction } = req.body;

    const allowedActions = [
      "REMOVE_CONTENT",
      "KEEP_CONTENT",
      "WARN_USER",
      "DISMISS_REPORT",
    ];

    if (!allowedActions.includes(adminAction)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_ADMIN_ACTION",
          message: "Invalid admin action",
        },
      });
    }

    const report = await updateReportAction(
      reportId,
      adminAction,
      req.user.userId
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        error: {
          code: "REPORT_NOT_FOUND",
          message: "Report not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_REPORT_FAILED",
        message: error.message,
      },
    });
  }
};

module.exports = {
  create,
  getAll,
  getOne,
  updateAction,
};