import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getModerationQueue } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function ModerationQueue() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await getModerationQueue(token);
        setQueue(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load moderation queue");
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f3efe8] px-5 pb-16 pt-3 text-[#1f2a25]">
        <div className="mx-auto max-w-7xl">
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-5xl font-black tracking-[-0.05em] text-[#1d201d]">
                Moderation Queue
              </h1>
              <p className="mt-3 text-[1.1rem] text-[#5a534a]">
                AI-flagged content awaiting your review.
              </p>
            </div>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee]"
            >
              Back to Dashboard
            </Link>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[1.15rem] font-black uppercase tracking-[0.08em] text-[#2d2a27]">
                Pending Review
              </h2>
              <Link
                to="/admin/audit"
                className="text-sm font-semibold text-[#5a544d] hover:text-[#1d4b39] transition"
              >
                View Audit Logs &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 text-[#5a544d]">
                Loading queue...
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#d9c5bc] bg-[#fffaf7] p-6 text-[#8b3c2b]">
                {error}
              </div>
            ) : queue.length === 0 ? (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-8 text-center text-[#5a544d]">
                No flagged content awaiting review.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[20px] border border-[#d6cfc4] bg-[#f7f4ef] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                <table className="w-full text-left text-sm text-[#5a544d]">
                  <thead className="border-b border-[#d6cfc4] text-xs font-semibold uppercase tracking-wider text-[#1f2a25]">
                    <tr>
                      <th className="py-4 px-5">Article Title</th>
                      <th className="py-4 px-5">Risk Score</th>
                      <th className="py-4 px-5">Severity</th>
                      <th className="py-4 px-5">AI Rec</th>
                      <th className="py-4 px-5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6cfc4]">
                    {queue.map((record) => (
                      <tr key={record._id} className="hover:bg-white transition-colors">
                        <td className="py-4 px-5 font-semibold text-[#1a1e1d]">
                          {record.targetId?.title || "Unknown Article"}
                        </td>
                        <td className="py-4 px-5 font-mono font-medium">
                          {record.riskScore}
                        </td>
                        <td className="py-4 px-5 uppercase text-xs font-bold">
                          {record.severity}
                        </td>
                        <td className="py-4 px-5">
                          <span className="inline-flex rounded-full bg-[#f0dfb2] px-3 py-1 text-xs font-bold text-[#986116]">
                            {record.aiRecommendation}
                          </span>
                        </td>
                        <td className="py-4 px-5">
                          <Link
                            to={`/admin/moderation/${record._id}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-[#1d4b39] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#163e2f]"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
