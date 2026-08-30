import { useState } from "react";
import "./admin.css";

const articles = [
  {
    id: 1,
    title: "What the Ocean Is Trying to Tell Us About Carbon",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "8 min",
    status: "Pending Review",
    submitted: "Aug 27, 2026",
    excerpt:
      "Scientists are discovering new clues about how oceans absorb and redistribute carbon, revealing a complex system that could reshape our understanding of climate change.",
  },
  {
    id: 2,
    title: "The Forgotten History of the Mechanical Computer",
    author: "Thomas Okeke",
    category: "Technology",
    readTime: "7 min",
    status: "Changes Requested",
    submitted: "Aug 26, 2026",
    excerpt:
      "Long before modern computers, ingenious mechanical machines were already performing calculations. Their history tells a fascinating story of human innovation.",
  },
];

function AdminDashboard() {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const [stats] = useState({
    pending: 1,
    changes: 1,
    published: 2,
    rejected: 1,
  });

  const handleAction = (action) => {
    if (!selectedArticle) return;

    alert(
      `${action} selected for "${selectedArticle.title}"`
    );
  };

  return (
    <div className="lumen-admin">

      {/* ================= NAVBAR ================= */}

      <header className="admin-navbar">

        <div className="lumen-brand">
          <div className="brand-icon">
            <span>▮</span>
            <span>▮</span>
          </div>

          <span className="brand-name">Lumen</span>
        </div>

        <nav className="admin-nav">

          <button className="nav-item">
            <span className="nav-icon">⊞</span>
            Home
          </button>

          <button className="nav-item">
            <span className="nav-icon">⌕</span>
            Browse
          </button>

          <button className="nav-item active">
            <span className="nav-icon">☑</span>
            Admin
          </button>

          <button className="nav-item">
            <span className="nav-icon">♙</span>
            Profile
          </button>

        </nav>

        <div className="navbar-right">

          <select className="admin-user-select" defaultValue="admin">
            <option value="admin">Amara Silva (admin)</option>
          </select>

          <button className="notification-icon">
            ♧
            <span className="notification-badge"></span>
          </button>

          <div className="avatar">AS</div>

        </div>

      </header>


      {/* ================= MAIN CONTENT ================= */}

      <main className="admin-main-content">

        {/* PAGE HEADING */}

        <section className="admin-heading">

          <div>
            <h1>Admin Dashboard</h1>

            <p>
              Review and moderate article submissions.
            </p>
          </div>

        </section>


        {/* ================= STAT CARDS ================= */}

        <section className="stats-grid">

          <div className="stat-card">

            <div className="stat-icon pending-icon">
              ◷
            </div>

            <div className="stat-number">
              {stats.pending}
            </div>

            <div className="stat-label">
              Pending Review
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon changes-icon">
              ↻
            </div>

            <div className="stat-number">
              {stats.changes}
            </div>

            <div className="stat-label">
              Changes Requested
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon published-icon">
              ✓
            </div>

            <div className="stat-number">
              {stats.published}
            </div>

            <div className="stat-label">
              Published
            </div>

          </div>


          <div className="stat-card">

            <div className="stat-icon rejected-icon">
              ×
            </div>

            <div className="stat-number">
              {stats.rejected}
            </div>

            <div className="stat-label">
              Rejected
            </div>

          </div>

        </section>


        {/* ================= REVIEW QUEUE ================= */}

        <section className="review-section">

          <div className="section-title">
            REVIEW QUEUE ({articles.length})
          </div>


          <div className="review-layout">

            {/* LEFT - ARTICLE LIST */}

            <div className="review-list">

              {articles.map((article) => (

                <button
                  key={article.id}
                  className={`article-card ${
                    selectedArticle?.id === article.id
                      ? "selected"
                      : ""
                  }`}
                  onClick={() => setSelectedArticle(article)}
                >

                  <div className="article-info">

                    <h3>
                      {article.title}
                    </h3>

                    <div className="article-meta">

                      <span>
                        {article.author}
                      </span>

                      <span>·</span>

                      <span>
                        {article.category}
                      </span>

                      <span>·</span>

                      <span>
                        {article.readTime}
                      </span>

                    </div>

                  </div>


                  <span
                    className={`status-pill ${
                      article.status === "Pending Review"
                        ? "pending-status"
                        : "changes-status"
                    }`}
                  >
                    {article.status}
                  </span>

                </button>

              ))}

            </div>


            {/* ================= REVIEW PANEL ================= */}

            <div className="review-panel">

              {!selectedArticle ? (

                <div className="empty-review">

                  <div className="empty-icon">
                    ▤
                  </div>

                  <p>
                    Select an article to review
                  </p>

                </div>

              ) : (

                <div className="article-review">

                  <div className="review-header">

                    <div>

                      <span className="review-category">
                        {selectedArticle.category}
                      </span>

                      <h2>
                        {selectedArticle.title}
                      </h2>

                      <div className="review-author">
                        By {selectedArticle.author}
                        <span>·</span>
                        {selectedArticle.readTime} read
                      </div>

                    </div>

                    <span
                      className={`status-pill ${
                        selectedArticle.status ===
                        "Pending Review"
                          ? "pending-status"
                          : "changes-status"
                      }`}
                    >
                      {selectedArticle.status}
                    </span>

                  </div>


                  <div className="review-divider"></div>


                  <div className="article-body">

                    <h4>Article Preview</h4>

                    <p>
                      {selectedArticle.excerpt}
                    </p>

                    <p>
                      The latest research provides important
                      insights into this subject. Researchers
                      continue to investigate how these findings
                      may affect our understanding of the world
                      around us.
                    </p>

                    <p>
                      This article has been submitted for review
                      by the Lumen editorial team.
                    </p>

                  </div>


                  <div className="review-actions">

                    <button
                      className="reject-button"
                      onClick={() =>
                        handleAction("Reject")
                      }
                    >
                      Reject
                    </button>

                    <button
                      className="changes-button"
                      onClick={() =>
                        handleAction("Request Changes")
                      }
                    >
                      Request Changes
                    </button>

                    <button
                      className="approve-button"
                      onClick={() =>
                        handleAction("Approve")
                      }
                    >
                      ✓ Approve
                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AdminDashboard;