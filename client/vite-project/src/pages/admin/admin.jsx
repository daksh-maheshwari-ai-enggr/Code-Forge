import { useEffect, useMemo, useState } from "react";
import {
  FiBookOpen,
  FiCheck,
  FiClock,
  FiShield,
  FiX,
} from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { getPendingArticles, reviewArticle } from "../../services/api";

const statStyles = {
  PENDING_REVIEW: {
    icon: FiClock,
    tone: "bg-[#f4e7cf] text-[#c07a1d] border-[#e8d5b0]",
  },
  PUBLISHED: {
    icon: FiShield,
    tone: "bg-[#dfeee4] text-[#2d7a4d] border-[#bfdcc9]",
  },
  REJECTED: {
    icon: FiX,
    tone: "bg-[#f7d9d8] text-[#c34a46] border-[#ebc1bf]",
  },
};

const statusMeta = {
  PENDING_REVIEW: { label: "Pending Review", pill: "bg-[#f0dfb2] text-[#986116]" },
  PUBLISHED: { label: "Published", pill: "bg-[#dbeee1] text-[#2f7d4f]" },
  REJECTED: { label: "Rejected", pill: "bg-[#f1d2d0] text-[#ae3e3a]" },
};

function AdminDashboard() {
  const [queue, setQueue] = useState([]);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [changeReason, setChangeReason] = useState("");
  const [reviewing, setReviewing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const loadPendingArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getPendingArticles(token);
        const articles = Array.from(
          new Map((response.data || []).map((article) => [article._id, article])).values(),
        );

        setQueue(articles);
        setSelectedArticleId(articles[0]?._id || null);
      } catch (err) {
        console.error("Failed to load pending articles:", err);
        setError("Unable to load pending articles.");
      } finally {
        setLoading(false);
      }
    };

    loadPendingArticles();
  }, []);

  const selectedArticle = queue.find((article) => article._id === selectedArticleId) || queue[0] || null;

  const stats = useMemo(
    () => ({
      pending: queue.length,
      published: 0,
      rejected: 0,
      changes: 0,
    }),
    [queue]
  );

  const handleDecision = async (articleId, decision) => {
    if (reviewing) return;
    const token = localStorage.getItem("authToken");

    try {
      setReviewing(true);
      if (decision === "REQUEST_CHANGES" && !changeReason.trim()) {
        alert("Please provide a reason for requesting changes.");
        return;
      }

      await reviewArticle(articleId, decision, token, changeReason.trim());
      setQueue((current) => current.filter((item) => item._id !== articleId));
      setChangeReason("");
      const nextQueue = queue.filter((item) => item._id !== articleId);
      setSelectedArticleId(nextQueue[0]?._id || null);
    } catch (err) {
      console.error("Failed to update article review:", err);
      alert(err.message || "Unable to update article review.");
    } finally {
      setReviewing(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f3efe8] px-5 pb-16 pt-3 text-[#1f2a25]">
        <div className="mx-auto max-w-7xl">
          <h1 className="mt-8 font-serif text-5xl font-black tracking-[-0.05em] text-[#1d201d]">
            Admin Dashboard
          </h1>
          <p className="mt-3 text-[1.1rem] text-[#5a534a]">
            Review and moderate article submissions.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { key: "pending", label: "Pending Review", value: stats.pending },
              { key: "changes", label: "Changes Requested", value: stats.changes },
              { key: "published", label: "Published", value: stats.published },
              { key: "rejected", label: "Rejected", value: stats.rejected },
            ].map((item) => {
              const meta =
                item.key === "pending"
                  ? statStyles.PENDING_REVIEW
                  : item.key === "published"
                    ? statStyles.PUBLISHED
                    : item.key === "rejected"
                      ? statStyles.REJECTED
                      : statStyles.PENDING_REVIEW;
              const Icon = meta.icon;

              return (
                <div
                  key={item.key}
                  className="rounded-[20px] border border-[#d9d0c2] bg-[#f8f6f1] p-5 shadow-[0_2px_0_rgba(0,0,0,0.02)]"
                >
                  <div className={`mb-8 flex h-12 w-12 items-center justify-center rounded-[12px] border ${meta.tone}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="text-4xl font-bold tracking-[-0.04em] text-[#1f2a25]">
                    {item.value}
                  </div>
                  <div className="mt-2 text-base text-[#554f48]">{item.label}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-10">
            <h2 className="mb-4 text-[1.15rem] font-black uppercase tracking-[0.08em] text-[#2d2a27]">
              Review Queue ({queue.length})
            </h2>

            {loading && (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 text-[#5a544d]">
                Loading pending articles...
              </div>
            )}

            {!loading && error && (
              <div className="rounded-[18px] border border-[#d9c5bc] bg-[#fffaf7] p-6 text-[#8b3c2b]">
                {error}
              </div>
            )}

            {!loading && !error && queue.length === 0 && (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-8 text-center text-[#5a544d]">
                No articles are waiting for review.
              </div>
            )}

            {!loading && !error && queue.length > 0 && (
              <>
                <div className="space-y-3">
                  {queue.map((article) => {
                    const isSelected = selectedArticle?._id === article._id;
                    const meta = statusMeta.PENDING_REVIEW;

                    return (
                      <button
                        key={article._id}
                        type="button"
                        onClick={() => setSelectedArticleId(article._id)}
                        className={`flex w-full items-center justify-between rounded-[18px] border bg-[#f7f4ef] px-5 py-5 text-left transition-all ${
                          isSelected
                            ? "border-[#b7c7bc] shadow-[0_0_0_1px_rgba(27,59,43,0.12)]"
                            : "border-[#d6cfc4] hover:border-[#c2b9ad]"
                        }`}
                      >
                        <div>
                          <h3 className="font-serif text-[1.05rem] text-[1.7rem] font-semibold tracking-[-0.03em] text-[#1a1e1d] sm:text-[1.35rem]">
                            {article.title}
                          </h3>

                          <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.95rem] text-[#5a544d]">
                            <span>{article.author?.name || "Unknown author"}</span>
                            <span className="text-[#9a9388]">•</span>
                            <span>{article.category}</span>
                            <span className="text-[#9a9388]">•</span>
                            <span>{article.readTime || "5 min"}</span>
                          </div>
                        </div>

                        <span className={`rounded-full px-3 py-1.5 text-sm font-medium ${meta.pill}`}>
                          {meta.label}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 rounded-[20px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                  {selectedArticle && (
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-serif text-3xl font-bold tracking-[-0.04em] text-[#1c1e1d]">
                          {selectedArticle.title}
                        </h3>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-[#5a544d]">
                          <span>{selectedArticle.author?.name || "Unknown author"}</span>
                          <span className="text-[#9a9388]">•</span>
                          <span>{selectedArticle.category}</span>
                          <span className="text-[#9a9388]">•</span>
                          <span>{selectedArticle.readTime || "5 min"}</span>
                        </div>
                      </div>

                      <p className="max-w-3xl text-base leading-7 text-[#4d473f]">
                        {selectedArticle.content?.slice(0, 500) || "No preview available for this article."}
                      </p>

                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                            Request changes reason
                          </label>
                          <textarea
                            value={changeReason}
                            onChange={(e) => setChangeReason(e.target.value)}
                            rows="3"
                            placeholder="Explain what needs to be revised..."
                            className="w-full rounded-xl border border-[#d6cfc4] bg-white px-4 py-3 text-sm outline-none focus:border-[#1d4b39]"
                          />
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleDecision(selectedArticle._id, "APPROVE")}
                            disabled={reviewing}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1d4b39] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163e2f]"
                          >
                            <FiCheck className="h-4 w-4" />
                            Approve Article
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(selectedArticle._id, "REQUEST_CHANGES")}
                            disabled={reviewing}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee] disabled:opacity-60"
                          >
                            <FiX className="h-4 w-4" />
                            Request Changes
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDecision(selectedArticle._id, "REJECT")}
                            disabled={reviewing}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee] disabled:opacity-60"
                          >
                            <FiX className="h-4 w-4" />
                            Reject Article
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;