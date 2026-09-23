import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getReportById,
  updateReportAction,
} from "../../services/api";
import "./ReportDetails.css";

function ReportDetails() {
  const navigate = useNavigate();
  const { reportId } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Please login first.");
          return;
        }

        const response = await getReportById(reportId, token);

        setReport(response.data);
      } catch (error) {
        console.error("Failed to fetch report:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [reportId]);

  // Handle admin action
  const handleAdminAction = async (adminAction) => {
    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setActionMessage("Please login first.");
        return;
      }

      setActionLoading(true);
      setActionMessage("");

      const response = await updateReportAction(
        reportId,
        adminAction,
        token
      );

      // Update the report on the page with the backend response
      setReport(response.data);

      setActionMessage(
        `Action "${adminAction}" completed successfully.`
      );
    } catch (error) {
      console.error("Failed to update report:", error);
      setActionMessage(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="details-not-found">
        <h2>Loading report...</h2>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="details-not-found">
        <h2>{error}</h2>

        <button onClick={() => navigate("/admin/reports")}>
          Back to Reports
        </button>
      </div>
    );
  }

  // Report not found
  if (!report) {
    return (
      <div className="details-not-found">
        <h2>Report not found</h2>

        <button onClick={() => navigate("/admin/reports")}>
          Back to Reports
        </button>
      </div>
    );
  }

  return (
    <div className="details-layout">
      {/* Sidebar */}
      <aside className="details-sidebar">
        <div className="details-brand">
          <div className="details-brand-icon">▱</div>

          <div>
            <h2>CMS Admin</h2>
            <span>Content Platform</span>
          </div>
        </div>

        <nav className="details-navigation">
          <a href="#">
            ▦ <span>Dashboard</span>
          </a>

          <a href="#">
            ▤ <span>Articles</span>
          </a>

          <a href="#">
            ? <span>Quizzes</span>
          </a>

          <a href="#">
            ♢ <span>Moderation</span>
            <b>38</b>
          </a>

          <a className="active" href="/admin/reports">
            ▤ <span>Reports</span>
          </a>

          <a href="#">
            ♧ <span>Users</span>
          </a>

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

        <div className="details-user">
          <div className="details-avatar">A</div>

          <div>
            <strong>Admin User</strong>
            <span>Super Admin</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="details-main">
        <header className="details-topbar">
          <h3>Report Details</h3>

          <div className="details-topbar-actions">
            <span>♧</span>
            <div className="details-top-avatar">A</div>
          </div>
        </header>

        <section className="details-content">
          {/* Back button */}
          <button
            className="back-button"
            onClick={() => navigate("/admin/reports")}
          >
            ‹ &nbsp; Back to Reports
          </button>

          {/* Heading */}
          <div className="details-heading">
            <h1>Report Details</h1>

            <p>
              {report._id} — Reported{" "}
              {new Date(report.createdAt).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </p>
          </div>

          <div className="details-cards">
            {/* Report Information */}
            <section className="information-card">
              <h2>REPORT INFORMATION</h2>

              <div className="information-row">
                <span>Reported Content</span>
                <strong>{report.contentId}</strong>
              </div>

              <div className="information-row">
                <span>Content Type</span>
                <strong>
                  {report.contentType === "ARTICLE"
                    ? "Article"
                    : report.contentType}
                </strong>
              </div>

              <div className="information-row">
                <span>Reporter</span>
                <strong>
                  {report.reporter?.name || "Unknown User"}
                </strong>
              </div>

              <div className="information-row">
                <span>Reported User</span>
                <strong>
                  {report.reportedUser?.name || "Unknown User"}
                </strong>
              </div>

              <div className="information-row">
                <span>Report Reason</span>
                <strong>{report.reason}</strong>
              </div>

              <div className="information-row">
                <span>Description</span>
                <strong>
                  {report.description ||
                    "No description provided"}
                </strong>
              </div>

              <div className="information-row">
                <span>Date Filed</span>
                <strong>
                  {new Date(
                    report.createdAt
                  ).toLocaleString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </strong>
              </div>

              <div className="information-row">
                <span>Status</span>
                <strong>{report.status}</strong>
              </div>
            </section>

            {/* AI Analysis */}
            <section className="analysis-card">
              <h2>AI MODERATION ANALYSIS</h2>

              <div className="risk-summary">
                <div>
                  <span>Risk Score</span>

                  <strong>
                    {Number(
                      report.aiRiskScore || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Risk Level</span>

                  <strong className="high-risk">
                    {report.aiRiskLevel}
                  </strong>
                </div>
              </div>

              <RiskBar
                label="AI Risk Score"
                percentage={Math.round(
                  Number(report.aiRiskScore || 0) * 100
                )}
              />

              <RiskBar
                label="Dangerous Activity"
                percentage={Math.round(
                  Number(report.aiRiskScore || 0) * 100
                )}
              />

              <RiskBar
                label="Overall Risk"
                percentage={Math.round(
                  Number(report.aiRiskScore || 0) * 100
                )}
              />

              <div className="ai-warning">
                ⓘ &nbsp; AI risk level:{" "}
                {report.aiRiskLevel}
              </div>
            </section>
          </div>

          {/* Admin Actions */}
          <section className="admin-actions">
            <h2>ADMIN ACTIONS</h2>

            {actionMessage && (
              <p>{actionMessage}</p>
            )}

            <div className="action-buttons">
              {/* Remove Content */}
              <button
                className="remove-button"
                onClick={() =>
                  handleAdminAction("REMOVE_CONTENT")
                }
                disabled={actionLoading}
              >
                🗑 &nbsp; Remove Content
              </button>

              {/* Keep Content */}
              <button
                className="keep-button"
                onClick={() =>
                  handleAdminAction("KEEP_CONTENT")
                }
                disabled={actionLoading}
              >
                🔒 &nbsp; Keep Content
              </button>

              {/* Warn User */}
              <button
                className="warn-button"
                onClick={() =>
                  handleAdminAction("WARN_USER")
                }
                disabled={actionLoading}
              >
                ⚠ &nbsp; Warn User
              </button>

              {/* Dismiss Report */}
              <button
                className="dismiss-button"
                onClick={() =>
                  handleAdminAction("DISMISS_REPORT")
                }
                disabled={actionLoading}
              >
                ▤ &nbsp; Dismiss Report
              </button>

              {/* View Appeal */}
              <button
                className="appeal-button"
                onClick={() =>
                  navigate(
                    `/admin/reports/${report._id}/appeal`
                  )
                }
              >
                ◉ &nbsp; View Appeal →
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}

function RiskBar({ label, percentage }) {
  return (
    <div className="risk-bar-container">
      <div className="risk-bar-heading">
        <span>{label}</span>
        <strong>{percentage}%</strong>
      </div>

      <div className="risk-bar-background">
        <div
          className="risk-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ReportDetails;