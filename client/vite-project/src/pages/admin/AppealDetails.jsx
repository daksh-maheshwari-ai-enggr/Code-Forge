
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getReportById,
  getAppealByReport,
  updateAppealDecision,
} from "../../services/api";

import "./AppealDetails.css";

function AppealDetails() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [appeal, setAppeal] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [decisionLoading, setDecisionLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch report + appeal
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Please login first.");
          return;
        }

        // Get report details
        const reportResponse = await getReportById(
          reportId,
          token
        );

        // Get appeal details
        const appealResponse = await getAppealByReport(
          reportId,
          token
        );

        setReport(reportResponse.data);
        setAppeal(appealResponse.data);
      } catch (error) {
        console.error("Failed to fetch appeal details:", error);
        setError(error.message || "Failed to load appeal details.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  // Convert backend status into UI text
  const formatDecision = (status) => {
    switch (status) {
      case "PENDING":
        return "Pending";

      case "ACCEPTED":
        return "Accepted";

      case "REJECTED":
        return "Rejected";

      case "MORE_INFO_REQUESTED":
        return "More Information Requested";

      default:
        return status || "Pending";
    }
  };

  // Convert backend admin action into readable text
  const formatAdminAction = (action) => {
    switch (action) {
      case "REMOVE_CONTENT":
        return "Remove Content";

      case "KEEP_CONTENT":
        return "Keep Content";

      case "WARN_USER":
        return "Warn User";

      case "DISMISS_REPORT":
        return "Dismiss Report";

      default:
        return "Not Available";
    }
  };

  // Handle admin decision
  const handleDecision = async (newStatus) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setMessage("Please login first.");
        return;
      }

      if (!appeal?._id) {
        setMessage("Appeal information is not available.");
        return;
      }

      setDecisionLoading(true);
      setMessage("");

      const response = await updateAppealDecision(
        appeal._id,
        newStatus,
        "",
        token
      );

      // Update appeal with backend response
      setAppeal(response.data);

      if (newStatus === "ACCEPTED") {
        setMessage("Appeal accepted successfully.");
      } else if (newStatus === "REJECTED") {
        setMessage("Appeal rejected successfully.");
      } else {
        setMessage(
          "Request for more information sent successfully."
        );
      }
    } catch (error) {
      console.error(
        "Failed to update appeal decision:",
        error
      );

      setMessage(
        error.message || "Failed to update appeal decision."
      );
    } finally {
      setDecisionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="appeal-not-found">
        <h2>Loading appeal details...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="appeal-not-found">
        <h2>{error}</h2>

        <button
          onClick={() => navigate("/admin/reports")}
        >
          Back to Reports
        </button>
      </div>
    );
  }

  // Report not found
  if (!report) {
    return (
      <div className="appeal-not-found">
        <h2>Report not found</h2>

        <button
          onClick={() => navigate("/admin/reports")}
        >
          Back to Reports
        </button>
      </div>
    );
  }

  // Appeal not found
  if (!appeal) {
    return (
      <div className="appeal-not-found">
        <h2>No appeal found for this report</h2>

        <button
          onClick={() =>
            navigate(`/admin/reports/${reportId}`)
          }
        >
          Back to Report Details
        </button>
      </div>
    );
  }

  const decision = formatDecision(appeal.status);

  const riskPercentage = Math.round(
    (report.aiRiskScore || 0) * 100
  );

  const submittedDate = appeal.createdAt
    ? new Date(appeal.createdAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not Available";

  const reviewedDate = appeal.reviewedAt
    ? new Date(appeal.reviewedAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "Not Reviewed";

  return (
    <div className="appeal-layout">

      {/* Sidebar */}
      <aside className="appeal-sidebar">
        <div className="appeal-brand">
          <div className="appeal-brand-icon">▱</div>

          <div>
            <h2>CMS Admin</h2>
            <span>Content Platform</span>
          </div>
        </div>

        <nav className="appeal-navigation">
          <a href="#">▦ <span>Dashboard</span></a>

          <a href="#">▤ <span>Articles</span></a>

          <a href="#">? <span>Quizzes</span></a>

          <a href="#">
            ♢ <span>Moderation</span>
            <b>38</b>
          </a>

          <a
            className="active"
            href="/admin/reports"
          >
            ▤ <span>Reports</span>
          </a>

          <a href="#">♧ <span>Users</span></a>

          <a href="#">
            ▣ <span>Subscriptions</span>
          </a>

          <a href="#">
            ♧ <span>Notifications</span>
          </a>

          <a href="#">
            ⚙ <span>Settings</span>
          </a>
        </nav>

        <div className="appeal-user">
          <div className="appeal-avatar">A</div>

          <div>
            <strong>Admin User</strong>
            <span>Super Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="appeal-main">

        <header className="appeal-topbar">
          <h3>Appeal Details</h3>

          <div className="appeal-topbar-actions">
            <span>♧</span>
            <div className="appeal-top-avatar">A</div>
          </div>
        </header>

        <section className="appeal-content">

          {/* Back Button */}
          <button
            className="appeal-back-button"
            onClick={() =>
              navigate(`/admin/reports/${report._id}`)
            }
          >
            ‹ &nbsp; Back to Report Details
          </button>

          {/* Page Heading */}
          <div className="appeal-heading">
            <div>
              <h1>Appeal Details</h1>

              <p>
                Appeal ID: {appeal._id}
                {" "}— Submitted {submittedDate}
              </p>
            </div>

            <span
              className={`pending-badge ${decision
                .toLowerCase()
                .replaceAll(" ", "-")}`}
            >
              {decision}
            </span>
          </div>

          {/* Information Cards */}
          <div className="appeal-cards">

            {/* Original Decision */}
            <section className="original-decision-card">
              <h2>ORIGINAL DECISION</h2>

              <div className="appeal-info-row">
                <span>Content</span>

                <strong>
                  {report.contentType}
                  {" - "}
                  {report.contentId}
                </strong>
              </div>

              <div className="appeal-info-row">
                <span>Author / Reported User</span>

                <strong>
                  {report.reportedUser?.name ||
                    "Unknown User"}
                </strong>
              </div>

              <div className="appeal-info-row">
                <span>Original Action</span>

                <strong>
                  {formatAdminAction(
                    report.adminAction
                  )}
                </strong>
              </div>

              <div className="appeal-info-row">
                <span>Reason</span>

                <strong>
                  {report.reason}
                </strong>
              </div>

              <div className="appeal-info-row">
                <span>AI Risk Score</span>

                <strong>
                  {riskPercentage}%
                  {" "}
                  ({report.aiRiskLevel})
                </strong>
              </div>

              <div className="appeal-info-row">
                <span>Report Status</span>

                <strong>
                  {report.status}
                </strong>
              </div>
            </section>

            {/* Appeal Message */}
            <section className="appeal-message-card">
              <h2>APPEAL MESSAGE</h2>

              <div className="appeal-message">
                "{appeal.message}"
              </div>

              <p className="submitted-date">
                Submitted: {submittedDate}
              </p>

              {appeal.appellant && (
                <p className="submitted-date">
                  Submitted by:{" "}
                  {appeal.appellant.name}
                  {" "}
                  ({appeal.appellant.email})
                </p>
              )}
            </section>
          </div>

          {/* Admin Decision */}
          <section className="admin-decision-card">
            <h2>ADMIN DECISION</h2>

            <div className="appeal-action-buttons">

              <button
                className="accept-appeal-button"
                onClick={() =>
                  handleDecision("ACCEPTED")
                }
                disabled={
                  decision !== "Pending" ||
                  decisionLoading
                }
              >
                {decisionLoading
                  ? "Processing..."
                  : "Accept Appeal"}
              </button>

              <button
                className="reject-appeal-button"
                onClick={() =>
                  handleDecision("REJECTED")
                }
                disabled={
                  decision !== "Pending" ||
                  decisionLoading
                }
              >
                {decisionLoading
                  ? "Processing..."
                  : "Reject Appeal"}
              </button>

              <button
                className="request-info-button"
                onClick={() =>
                  handleDecision(
                    "MORE_INFO_REQUESTED"
                  )
                }
                disabled={
                  decision !== "Pending" ||
                  decisionLoading
                }
              >
                {decisionLoading
                  ? "Processing..."
                  : "Request More Information"}
              </button>
            </div>

            {/* Decision Status */}
            <p className="decision-status">
              Current Status:{" "}
              <strong>{decision}</strong>
            </p>

            {/* Reviewed Information */}
            {appeal.reviewedAt && (
              <p className="decision-status">
                Reviewed:{" "}
                <strong>{reviewedDate}</strong>
              </p>
            )}

            {/* Admin Note */}
            {appeal.adminNote && (
              <p className="decision-status">
                Admin Note:{" "}
                <strong>{appeal.adminNote}</strong>
              </p>
            )}

            {/* Success / Error Message */}
            {message && (
              <p className="decision-message">
                {message}
              </p>
            )}
          </section>

        </section>
      </main>
    </div>
  );
}

export default AppealDetails;

