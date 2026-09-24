import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuditLogs } from "../../services/api";
import Navbar from "../../components/Navbar";

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await getAuditLogs(token);
        setLogs(res.data || []);
      } catch (err) {
        setError(err.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#f3efe8] px-5 pb-16 pt-3 text-[#1f2a25]">
        <div className="mx-auto max-w-7xl">
          <div className="mt-8 flex items-center justify-between">
            <div>
              <h1 className="font-serif text-5xl font-black tracking-[-0.05em] text-[#1d201d]">
                Audit Logs
              </h1>
              <p className="mt-3 text-[1.1rem] text-[#5a534a]">
                History of moderation actions and AI decisions.
              </p>
            </div>
            <Link
              to="/admin/moderation"
              className="inline-flex items-center gap-2 rounded-xl border border-[#d9c5bc] bg-[#fffaf7] px-4 py-2.5 text-sm font-semibold text-[#8b3c2b] transition hover:bg-[#fff2ee]"
            >
              &larr; Back to Queue
            </Link>
          </div>

          <div className="mt-10">
            {loading ? (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 text-[#5a544d]">
                Loading logs...
              </div>
            ) : error ? (
              <div className="rounded-[18px] border border-[#d9c5bc] bg-[#fffaf7] p-6 text-[#8b3c2b]">
                {error}
              </div>
            ) : logs.length === 0 ? (
              <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-8 text-center text-[#5a544d]">
                No audit logs available.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[20px] border border-[#d6cfc4] bg-[#f7f4ef] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.2)]">
                <table className="w-full text-left text-sm text-[#5a544d]">
                  <thead className="border-b border-[#d6cfc4] text-xs font-semibold uppercase tracking-wider text-[#1f2a25]">
                    <tr>
                      <th className="py-4 px-5">Timestamp</th>
                      <th className="py-4 px-5">Action</th>
                      <th className="py-4 px-5">Target</th>
                      <th className="py-4 px-5">Admin / Source</th>
                      <th className="py-4 px-5">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d6cfc4]">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-white transition-colors">
                        <td className="py-4 px-5 font-mono text-xs whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-5 font-semibold text-[#1a1e1d]">
                          {log.action}
                        </td>
                        <td className="py-4 px-5">
                          {log.targetId ? log.targetId.substring(0, 8) + '...' : 'N/A'}
                        </td>
                        <td className="py-4 px-5">
                          {log.adminId?.name || "System"}
                        </td>
                        <td className="py-4 px-5 text-xs text-[#5a544d]">
                          {log.notes || "-"}
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
