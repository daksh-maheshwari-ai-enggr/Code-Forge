import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getModerationRecord, reviewModerationRecord } from "../../services/api";
import DOMPurify from "dompurify";
import Navbar from "../../components/Navbar";

export default function ModerationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await getModerationRecord(id, token);
        setRecord(res.data);
      } catch (err) {
        setError(err.message || "Failed to load moderation record");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [id]);

  const handleDecision = async (finalDecision) => {
    if (submitting) return;
    
    if (finalDecision === "CHANGES_REQUESTED" && !adminNotes.trim()) {
      alert("Please provide notes for the requested changes.");
      return;
    }

    try {
      setSubmitting(true);
      const token = localStorage.getItem("authToken");
      await reviewModerationRecord(id, finalDecision, token, adminNotes);
      navigate("/admin/moderation");
    } catch (err) {
      alert(err.message || "Failed to submit decision");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f3efe8] px-5 pb-16 pt-3 text-[#1f2a25]">
        <div className="mx-auto max-w-7xl">
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-5xl font-black tracking-[-0.05em] text-[#1d201d]">
                Review Flagged Content
              </h1>
            </div>
            <Link
              to="/admin/moderation"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee]"
            >
              &larr; Back to Queue
            </Link>
          </div>

          {loading ? (
            <div className="mt-8 rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 text-[#5a544d]">
              Loading details...
            </div>
          ) : error || !record ? (
            <div className="mt-8 rounded-[18px] border border-[#d9c5bc] bg-[#fffaf7] p-6 text-[#8b3c2b]">
              {error || "Record not found"}
            </div>
          ) : (
            <div className="mt-8 grid gap-8 lg:grid-cols-3">
              {/* Left Column: Content */}
              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-[20px] border border-[#d6cfc4] bg-white p-8 shadow-sm">
                  <h2 className="font-serif text-3xl font-bold tracking-[-0.03em] text-[#1c1e1d]">
                    {record.targetId?.title || "Untitled"}
                  </h2>
                  <div className="mt-6 text-base leading-relaxed text-[#4d473f]">
                    {record.targetId?.content ? (
                      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(record.targetId.content) }} />
                    ) : (
                      "No content available."
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: AI Analysis & Actions */}
              <div className="space-y-6">
                <div className="rounded-[20px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-[#2d2a27]">
                    AI Analysis
                  </h3>
                  
                  <div className="mb-6 space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#5a544d]">Risk Score</span>
                        <span className={`font-bold ${record.riskScore > 70 ? 'text-[#c34a46]' : record.riskScore > 20 ? 'text-[#c07a1d]' : 'text-[#2d7a4d]'}`}>
                          {record.riskScore}/100
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-[#e3dcd1]">
                        <div
                          className={`h-full ${record.riskScore > 70 ? 'bg-[#c34a46]' : record.riskScore > 20 ? 'bg-[#c07a1d]' : 'bg-[#2d7a4d]'}`}
                          style={{ width: `${record.riskScore}%` }}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <span className="block text-xs uppercase tracking-wider text-[#9a9388]">Severity</span>
                      <span className="font-medium text-[#1c1e1d]">{record.severity}</span>
                    </div>

                    <div>
                      <span className="block text-xs uppercase tracking-wider text-[#9a9388]">Categories</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {record.categories?.length > 0 ? (
                          record.categories.map((cat, i) => (
                            <span key={i} className="rounded bg-[#e8e4db] px-2 py-1 text-xs font-medium text-[#5a544d]">
                              {cat}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-[#5a544d]">None</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="block text-xs uppercase tracking-wider text-[#9a9388]">AI Reason</span>
                      <p className="mt-1 text-sm text-[#4d473f]">{record.aiReason || "N/A"}</p>
                    </div>

                    <div className="pt-2 border-t border-[#d6cfc4]">
                      <span className="block text-xs uppercase tracking-wider text-[#9a9388]">AI Recommendation</span>
                      <span className="mt-1 inline-block font-semibold text-[#1c1e1d] bg-white border border-[#d6cfc4] px-3 py-1 rounded">
                        {record.aiRecommendation}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[20px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-[#2d2a27]">
                    Final Decision
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-[#4d473f]">
                        Admin Notes / Review Reason
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="3"
                        placeholder="Required if requesting changes..."
                        className="w-full rounded-xl border border-[#d6cfc4] bg-white px-4 py-3 text-sm outline-none focus:border-[#1d4b39]"
                      />
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => handleDecision("APPROVED")}
                        disabled={submitting}
                        className="w-full rounded-xl bg-[#2d7a4d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#235e3c]"
                      >
                        Override & Approve
                      </button>
                      <button
                        onClick={() => handleDecision("CHANGES_REQUESTED")}
                        disabled={submitting}
                        className="w-full rounded-xl border border-[#d6cfc4] bg-white px-4 py-3 text-sm font-semibold text-[#5a544d] transition hover:bg-stone-50"
                      >
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleDecision("REJECTED")}
                        disabled={submitting}
                        className="w-full rounded-xl bg-[#c34a46] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#963733]"
                      >
                        Confirm Block (Reject)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
