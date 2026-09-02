import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit3, FiFileText, FiEye } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import { getMyArticles } from "../../services/api";

const statusStyles = {
  PENDING_REVIEW: "bg-[#f0dfb2] text-[#986116]",
  CHANGES_REQUESTED: "bg-[#f0d3b6] text-[#a95d2d]",
  PUBLISHED: "bg-[#dbeee1] text-[#2f7d4f]",
  REJECTED: "bg-[#f1d2d0] text-[#ae3e3a]",
};

const statusLabels = {
  PENDING_REVIEW: "Pending Review",
  CHANGES_REQUESTED: "Changes Requested",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
};

const fallbackAvatar =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80";

export default function Profile() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    const loadArticles = async () => {
      if (!token || !user) return;

      try {
        const response = await getMyArticles(token);
        setArticles(response.data || []);
      } catch (error) {
        console.error("Failed to load profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [user]);

  if (!user) {
    return null;
  }

  const publishedCount = articles.filter((article) => article.status === "PUBLISHED").length;

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f5f1e8] px-5 py-8 text-[#1d201d]">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-[22px] border border-[#d9d0c2] bg-[#f7f4ef] p-8 shadow-sm">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <img
                src={user.avatarUrl || fallbackAvatar}
                alt={user.name}
                className="h-28 w-28 rounded-full object-cover ring-4 ring-[#e9e1d9]"
              />

              <div className="flex-1">
                <h1 className="font-serif text-4xl font-black tracking-[-0.04em] text-[#1d201d]">
                  {user.name}
                </h1>

                <p className="mt-3 max-w-2xl text-lg text-[#554f48]">
                  {user.bio || "Science communicator and molecular biologist. Writing about the invisible world."}
                </p>

                <div className="mt-6 flex flex-wrap gap-8 text-center text-[#1d201d]">
                  <div>
                    <div className="text-3xl font-bold">{articles.length}</div>
                    <div className="text-sm text-[#5a544d]">Articles</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{publishedCount}</div>
                    <div className="text-sm text-[#5a544d]">Published</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{articles.reduce((sum, article) => sum + (article.views || 0), 0).toLocaleString()}</div>
                    <div className="text-sm text-[#5a544d]">Total Views</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{articles.reduce((sum, article) => sum + (article.likes || 0), 0)}</div>
                    <div className="text-sm text-[#5a544d]">Total Likes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h2 className="mb-6 font-serif text-4xl font-black tracking-[-0.04em] text-[#1d201d]">
            My Articles
          </h2>

          {loading && (
            <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-6 text-[#5a544d]">
              Loading articles...
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div className="rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] p-10 text-center text-[#5a544d]">
              <FiFileText className="mx-auto mb-4 h-12 w-12 text-[#9a9388]" />
              <p className="text-xl font-medium">No articles yet.</p>
            </div>
          )}

          {!loading && articles.length > 0 && (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article._id}
                  className="flex flex-col gap-4 rounded-[18px] border border-[#d6cfc4] bg-[#f7f4ef] px-5 py-5 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={article.coverImage || fallbackAvatar}
                      alt={article.title}
                      className="h-16 w-16 rounded-xl object-cover"
                    />

                    <div>
                      <h3 className="font-serif text-2xl font-semibold tracking-[-0.03em] text-[#1d201d]">
                        {article.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[#5a544d]">
                        <span>{article.category}</span>
                        <span>•</span>
                        <span>{article.readTime || "5 min"}</span>
                        <span>•</span>
                        <span>{article.views || 0} views</span>
                        <span>•</span>
                        <span>{article.likes || 0} likes</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-sm font-medium ${statusStyles[article.status] || "bg-[#ece7dc] text-[#5a544d]"}`}
                    >
                      {statusLabels[article.status] || article.status}
                    </span>

                    {article.status === "CHANGES_REQUESTED" && (
                      <Link
                        to={`/author/articles/${article._id}/edit`}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#1d4b39] px-3 py-2 text-sm font-semibold text-white hover:bg-[#163e2f]"
                      >
                        <FiEdit3 className="h-4 w-4" />
                        Edit & Resubmit
                      </Link>
                    )}

                    {article.status === "PUBLISHED" && (
                      <span className="flex items-center gap-2 text-[#4d473f]">
                        <FiEye className="h-4 w-4" />
                        Live
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
