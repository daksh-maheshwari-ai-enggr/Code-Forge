
import { useMemo, useState } from "react";
import "./Reports.css";
import reportsMockData from "../../data/reportsMockData";

function Reports() {
  const [search, setSearch] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredReports = useMemo(() => {
    return reportsMockData.filter((report) =>
      Object.values(report)
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search]);

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

          <a className="active" href="#">
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
          <div className="reports-heading">
            <h1>Reports</h1>
            <p>User-submitted reports on content and users.</p>
          </div>

          {/* Statistics Cards */}
          <div className="reports-statistics">
            <div className="stat-card">
              <span>Total Reports</span>
              <strong>14</strong>
            </div>

            <div className="stat-card">
              <span>Open</span>
              <strong className="open-number">7</strong>
            </div>

            <div className="stat-card">
              <span>Under Review</span>
              <strong className="review-number">4</strong>
            </div>

            <div className="stat-card">
              <span>Resolved</span>
              <strong className="resolved-number">3</strong>
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
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

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
                      <td className="report-id">{report.id}</td>

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
                          onClick={() => setSelectedReport(report)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <p className="no-reports">No reports found.</p>
            )}
          </section>
        </section>
      </main>

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="report-modal-overlay">
          <div className="report-modal">
            <button
              className="close-modal"
              onClick={() => setSelectedReport(null)}
            >
              ×
            </button>

            <h2>Report Details</h2>

            <p>
              <strong>Report ID:</strong> {selectedReport.id}
            </p>

            <p>
              <strong>Content:</strong> {selectedReport.content}
            </p>

            <p>
              <strong>Type:</strong> {selectedReport.type}
            </p>

            <p>
              <strong>User:</strong> {selectedReport.user}
            </p>

            <p>
              <strong>Reason:</strong> {selectedReport.reason}
            </p>

            <p>
              <strong>AI Risk:</strong> {selectedReport.risk}
            </p>

            <p>
              <strong>Status:</strong> {selectedReport.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;