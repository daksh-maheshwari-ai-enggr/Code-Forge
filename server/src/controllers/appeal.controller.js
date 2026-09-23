const {
  createAppeal,
  getAppealByReportId,
  getAppealById,
  updateAppealDecision,
} = require("../services/appeal.service");

// Create an appeal
const create = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_APPEAL",
          message: "Appeal message is required",
        },
      });
    }

    const appeal = await createAppeal({
      report: reportId,
      appellant: req.user.userId,
      message,
    });

    return res.status(201).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "CREATE_APPEAL_FAILED",
        message: error.message,
      },
    });
  }
};

// Get appeal using report ID
const getByReport = async (req, res) => {
  try {
    const { reportId } = req.params;

    const appeal = await getAppealByReportId(reportId);

    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPEAL_NOT_FOUND",
          message: "No appeal found for this report",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_APPEAL_FAILED",
        message: error.message,
      },
    });
  }
};

// Get appeal using appeal ID
const getOne = async (req, res) => {
  try {
    const { appealId } = req.params;

    const appeal = await getAppealById(appealId);

    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPEAL_NOT_FOUND",
          message: "Appeal not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "GET_APPEAL_FAILED",
        message: error.message,
      },
    });
  }
};

// Update appeal decision
const updateDecision = async (req, res) => {
  try {
    const { appealId } = req.params;
    const { status, adminNote } = req.body;

    const allowedStatuses = [
      "ACCEPTED",
      "REJECTED",
      "MORE_INFO_REQUESTED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_APPEAL_STATUS",
          message: "Invalid appeal decision",
        },
      });
    }

    const appeal = await updateAppealDecision(
      appealId,
      status,
      adminNote || "",
      req.user.userId
    );

    if (!appeal) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPEAL_NOT_FOUND",
          message: "Appeal not found",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: appeal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: {
        code: "UPDATE_APPEAL_FAILED",
        message: error.message,
      },
    });
  }
};

module.exports = {
  create,
  getByReport,
  getOne,
  updateDecision,
};