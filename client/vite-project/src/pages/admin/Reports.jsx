import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Reports.css";
import { getAllReports } from "../../services/api";

function Reports() {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("authToken");

        if (!token) {
          setError("Please login first.");
          return;
        }

        const response = await getAllReports(token);

        const formattedReports = response.data.map((report) => ({
          id: report._id,
          content: report.contentId,
          type: report.contentType,
          user: report.reportedUser?.name || "Unknown User",
          reason: report.reason,
          risk: report.aiRiskScore,
          riskLevel: report.aiRiskLevel,
          status: formatStatus(report.status),
        }));

        setReports(formattedReports);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
        setError(err.message || "Failed to load reports.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatStatus = (status) => {
    if (status === "UNDER_REVIEW") return "Under Review";
    if (status === "OPEN") return "Open";
    if (status === "RESOLVED") return "Resolved";
    if (status === "DISMISSED") return "Dismissed";

    return status;
  };

  const filteredReports = useMemo(() => {
    return reports.filter((report) =>
      Object.values(report)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [reports, search]);

  const totalReports = reports.length;

  const openReports = reports.filter(
    (report) => report.status === "Open"
  ).length;

  const underReviewReports = reports.filter(
    (report) => report.status === "Under Review"
  ).length;

  const resolvedReports = reports.filter(
    (report) => report.status === "Resolved"
  ).length;

  return (
    <div className="reports-layout">
      {/* Sidebar */}
      <aside className="reports-sidebar">
        <div className="reports-brand">
          <div className="brand-icon">▱</div>

          <div>
            <h2>CMS Admin</h2>
            <span>Content Platform</span>
          </div>
        </div>

        <nav className="reports-navigation">
          <a href="#">▦ <span>Dashboard</span></a>
          <a href="#">▤ <span>Articles</span></a>
          <a href="#">? <span>Quizzes</span></a>

          <a href="#">
            ♢ <span>Moderation</span>
            <b className="moderation-count">38</b>
          </a>

          <a
            className="active"
            href="/admin/reports"
          >
            ▤ <span>Reports</span>
          </a>

          <a href="#">♧ <span>Users</span></a>
          <a href="#">▣ <span>Subscriptions</span></a>
          <a href="#">♧ <span>Notifications</span></a>
          <a href="#">⚙ <span>Settings</span></a>
        </nav>

        <div className="reports-user">
          <div className="user-avatar">A</div>

          <div>
            <strong>Admin User</strong>
            <span>Super Admin</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="reports-main">
        <header className="reports-topbar">
          <h3>Reports</h3>

          <div className="topbar-actions">
            <span className="notification-icon">♧</span>
            <div className="topbar-avatar">A</div>
          </div>
        </header>

        <section className="reports-content">
          {/* Page Heading */}
          <div className="reports-heading">
            <h1>Reports</h1>
            <p>User-submitted reports on content and users.</p>
          </div>

          {/* Statistics Cards */}
          <div className="reports-statistics">
            <div className="stat-card">
              <span>Total Reports</span>
              <strong>{totalReports}</strong>
            </div>

            <div className="stat-card">
              <span>Open</span>
              <strong className="open-number">
                {openReports}
              </strong>
            </div>

            <div className="stat-card">
              <span>Under Review</span>
              <strong className="review-number">
                {underReviewReports}
              </strong>
            </div>

            <div className="stat-card">
              <span>Resolved</span>
              <strong className="resolved-number">
                {resolvedReports}
              </strong>
            </div>
          </div>

          {/* Reports Table */}
          <section className="reports-table-container">
            <div className="table-header">
              <h2>All Reports</h2>

              <input
                type="text"
                placeholder="⌕  Search reports..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />
            </div>

            {loading && (
              <p className="no-reports">
                Loading reports...
              </p>
            )}

            {error && (
              <p className="no-reports">
                {error}
              </p>
            )}

            {!loading && !error && (
              <div className="table-scroll">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>REPORT ID</th>
                      <th>REPORTED CONTENT</th>
                      <th>TYPE</th>
                      <th>REPORTED USER</th>
                      <th>REASON</th>
                      <th>AI RISK</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredReports.map((report) => (
                      <tr key={report.id}>
                        <td className="report-id">
                          {report.id}
                        </td>

                        <td className="content-name">
                          {report.content}
                        </td>

                        <td>{report.type}</td>

                        <td>{report.user}</td>

                        <td>{report.reason}</td>

                        <td>
                          <span
                            className={`risk ${report.riskLevel.toLowerCase()}`}
                          >
                            {report.risk} ({report.riskLevel})
                          </span>
                        </td>

                        <td>
                          <span
                            className={`status ${report.status
                              .toLowerCase()
                              .replaceAll(" ", "-")}`}
                          >
                            {report.status}
                          </span>
                        </td>

                        <td>
                          <button
                            className="view-button"
                            onClick={() =>
                              navigate(
                                `/admin/reports/${report.id}`
                              )
                            }
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading &&
              !error &&
              filteredReports.length === 0 && (
                <p className="no-reports">
                  No reports found.
                </p>
              )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default Reports;