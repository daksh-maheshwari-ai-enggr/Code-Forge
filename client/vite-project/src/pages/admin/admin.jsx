import { useMemo, useState } from "react";
import { FiBookOpen, FiCheck, FiClock, FiRefreshCw, FiShield, FiX } from "react-icons/fi";
import Navbar from "../../components/Navbar";

const initialQueue = [
  {
    id: 1,
    title: "What the Ocean Is Trying to Tell Us About Carbon",
    author: "Priya Mehta",
    category: "Environment",
    readTime: "8 min",
    status: "PENDING_REVIEW",
    summary:
      "A deep dive into how marine ecosystems absorb carbon and why major climate models still underestimate the role of oceanic chemistry.",
  },
  {
    id: 2,
    title: "The Forgotten History of the Mechanical Computer",
    author: "Thomas Okeke",
    category: "Technology",
    readTime: "7 min",
    status: "CHANGES_REQUESTED",
    summary:
      "Reconstructing the early mechanical devices that shaped the logic of modern computation and the people who built them before electronics existed.",
  },
  {
    id: 3,
    title: "Designing for Calm in a Noisy Digital World",
    author: "Aisha Rahman",
    category: "UX",
    readTime: "9 min",
    status: "PUBLISHED",
    summary:
      "Why interface clarity, friction reduction, and slower interactions can create healthier digital products for users and teams alike.",
  },
  {
    id: 4,
    title: "The Future of Open-Source Medicine",
    author: "Marco Lee",
    category: "Health",
    readTime: "6 min",
    status: "REJECTED",
    summary:
      "Open-source collaboration is reshaping how healthcare research is shared, validated, and published across institutions and countries.",
  },
];

const statStyles = {
  PENDING_REVIEW: {
    icon: FiClock,
    tone: "bg-[#f4e7cf] text-[#c07a1d] border-[#e8d5b0]",
  },
  CHANGES_REQUESTED: {
    icon: FiRefreshCw,
    tone: "bg-[#f6e3d8] text-[#c97b3d] border-[#efcdb5]",
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
  CHANGES_REQUESTED: { label: "Changes Requested", pill: "bg-[#f0d3b6] text-[#a95d2d]" },
  PUBLISHED: { label: "Published", pill: "bg-[#dbeee1] text-[#2f7d4f]" },
  REJECTED: { label: "Rejected", pill: "bg-[#f1d2d0] text-[#ae3e3a]" },
};

function AdminDashboard() {
  const [queue, setQueue] = useState(initialQueue);
  const [selectedArticleId, setSelectedArticleId] = useState(initialQueue[0].id);

  const selectedArticle =
    queue.find((article) => article.id === selectedArticleId) || queue[0] || null;

  const stats = useMemo(
    () => ({
      pending: queue.filter((item) => item.status === "PENDING_REVIEW").length,
      changes: queue.filter((item) => item.status === "CHANGES_REQUESTED").length,
      published: queue.filter((item) => item.status === "PUBLISHED").length,
      rejected: queue.filter((item) => item.status === "REJECTED").length,
    }),
    [queue]
  );

  const handleDecision = (articleId, decision) => {
    setQueue((current) =>
      current.map((article) =>
        article.id === articleId
          ? {
              ...article,
              status: decision === "APPROVE" ? "PUBLISHED" : "REJECTED",
            }
          : article
      )
    );
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
              const meta = statStyles[item.key === "pending" ? "PENDING_REVIEW" : item.key === "changes" ? "CHANGES_REQUESTED" : item.key === "published" ? "PUBLISHED" : "REJECTED"];
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
              Review Queue ({queue.filter((item) => item.status !== "PUBLISHED" && item.status !== "REJECTED").length})
            </h2>

            <div className="space-y-3">
              {queue
                .filter((item) => item.status !== "PUBLISHED" && item.status !== "REJECTED")
                .map((article) => {
                  const isSelected = selectedArticle?.id === article.id;
                  const meta = statusMeta[article.status];

                  return (
                    <button
                      key={article.id}
                      type="button"
                      onClick={() => setSelectedArticleId(article.id)}
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
                          <span>{article.author}</span>
                          <span className="text-[#9a9388]">•</span>
                          <span>{article.category}</span>
                          <span className="text-[#9a9388]">•</span>
                          <span>{article.readTime}</span>
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
              {selectedArticle ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="font-serif text-3xl font-bold tracking-[-0.04em] text-[#1c1e1d]">
                      {selectedArticle.title}
                    </h3>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-[#5a544d]">
                      <span>{selectedArticle.author}</span>
                      <span className="text-[#9a9388]">•</span>
                      <span>{selectedArticle.category}</span>
                      <span className="text-[#9a9388]">•</span>
                      <span>{selectedArticle.readTime}</span>
                    </div>
                  </div>

                  <p className="max-w-3xl text-base leading-7 text-[#4d473f]">
                    {selectedArticle.summary}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => handleDecision(selectedArticle.id, "APPROVE")}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#1d4b39] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#163e2f]"
                    >
                      <FiCheck className="h-4 w-4" />
                      Approve Article
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDecision(selectedArticle.id, "REJECT")}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee]"
                    >
                      <FiX className="h-4 w-4" />
                      Reject Article
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 py-8 text-[#7b7369]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-[#d8d0c7] bg-[#f1efe9]">
                    <FiBookOpen className="h-8 w-8" />
                  </div>
                  <p className="text-xl font-medium">Select an article to review</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;