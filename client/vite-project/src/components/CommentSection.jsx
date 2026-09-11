import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiCornerUpLeft, FiMessageCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { createComment, getComments } from "../services/api";

const initials = (name = "") => name.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase();

function Comment({ comment, onReply }) {
  const author = comment.author || {};
  return (
    <div className="border-b border-stone-200 py-5 last:border-0">
      <div className="flex gap-3">
        {author.avatarUrl ? <img src={author.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" /> : <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1B3B2B] text-xs font-semibold text-white">{initials(author.name)}</span>}
        <div className="min-w-0 flex-1">
          <Link to={`/profile/${author._id}`} className="font-semibold text-stone-900 hover:text-[#1B3B2B] hover:underline">{author.name || "Unknown user"}</Link>
          <span className="ml-2 text-xs text-stone-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
          <p className="mt-2 whitespace-pre-wrap text-[15px] leading-6 text-stone-700">{comment.content}</p>
          <button type="button" onClick={() => onReply(comment)} className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[#1B3B2B] hover:underline"><FiCornerUpLeft /> Reply</button>
          {comment.replies?.length > 0 && <div className="mt-2 border-l-2 border-stone-200 pl-4">{comment.replies.map((reply) => <Comment key={reply._id} comment={reply} onReply={onReply} />)}</div>}
        </div>
      </div>
    </div>
  );
}

export default function CommentSection({ articleId, context = "ARTICLE" }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadComments = async () => {
    try {
      const response = await getComments(articleId, context);
      setComments(response.data || []);
    } catch { setError("Unable to load comments."); }
  };
  useEffect(() => { loadComments(); }, [articleId, context]);

  const requireLogin = () => {
    if (!isAuthenticated) { navigate("/login", { state: { from: `/read/${articleId}` } }); return true; }
    return false;
  };
  const handleReply = (comment) => {
    if (requireLogin()) return;
    setReplyTo(comment);
    document.getElementById(`comment-input-${context}`)?.focus();
  };
  const submit = async (event) => {
    event.preventDefault();
    if (requireLogin() || !content.trim()) return;
    try {
      setSaving(true); setError("");
      await createComment(articleId, content, localStorage.getItem("authToken"), replyTo?._id, context);
      setContent(""); setReplyTo(null); await loadComments();
    } catch (err) { setError(err.message || "Unable to post your comment."); }
    finally { setSaving(false); }
  };

  return <section className="mt-12 border-t border-stone-200 pt-10">
    <div className="flex items-center gap-2"><FiMessageCircle className="text-[#1B3B2B]" /><h2 className="font-editorial text-3xl font-bold text-stone-900">Discussion</h2></div>
    <p className="mt-2 text-sm text-stone-500">Share your thoughts and reply to other readers.</p>
    <form onSubmit={submit} className="mt-6">
      {replyTo && <div className="mb-2 flex items-center justify-between rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-600">Replying to {replyTo.author?.name}<button type="button" onClick={() => setReplyTo(null)} className="font-semibold text-stone-700">Cancel</button></div>}
      <textarea id={`comment-input-${context}`} value={content} onChange={(event) => setContent(event.target.value)} onFocus={requireLogin} placeholder="Add a comment..." rows="4" className="w-full rounded-xl border border-stone-300 bg-white p-3 text-sm outline-none focus:border-[#1B3B2B]" />
      <div className="mt-3 flex items-center justify-between gap-3"><span className="text-sm text-red-600">{error}</span><button type="submit" className="rounded-lg bg-[#1B3B2B] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#153124]">{saving ? "Posting..." : replyTo ? "Post reply" : "Post comment"}</button></div>
    </form>
    <div className="mt-6">{comments.length ? comments.map((comment) => <Comment key={comment._id} comment={comment} onReply={handleReply} />) : <p className="py-5 text-sm text-stone-500">Be the first to start the discussion.</p>}</div>
  </section>;
}
