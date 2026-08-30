import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CATEGORIES } from "../../data/mockArticles";
import { getArticles } from "../../services/api";
import FeaturedHeroCard from "../../components/FeaturedHeroCard";
import ArticleCard from "../../components/ArticleCard";
import Navbar from "../../components/Navbar";

export default function HomePage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getArticles();

        setArticles(response.data || []);
      } catch (error) {
        console.error("Failed to fetch articles:", error);
        setError("Failed to load articles.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // For now, first published article is featured
  const featuredArticle = articles[0];

  // Remaining articles are shown as recent articles
  const recentArticles = articles.slice(1);

  return (
    <>
      <Navbar />

      <div className="w-full text-stone-800 pb-16">
        <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">

          {/* Loading State */}
          {loading && (
            <div className="py-20 text-center text-stone-500">
              Loading articles...
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-20 text-center text-red-500">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && articles.length === 0 && (
            <div className="py-20 text-center text-stone-500">
              No articles available yet.
            </div>
          )}

          {/* Featured Hero Section */}
          {!loading && !error && featuredArticle && (
            <FeaturedHeroCard article={featuredArticle} />
          )}

          {/* Recent Articles Section */}
          {!loading && !error && recentArticles.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-baseline justify-between border-b border-stone-200/80 pb-3">
                <h2 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
                  Recent Articles
                </h2>

                <span className="text-xs text-stone-400">
                  {recentArticles.length} articles
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentArticles.map((article) => (
                  <ArticleCard
                    key={article._id}
                    article={article}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Browse By Category Section */}
          <section className="space-y-4 pt-4">
            <h3 className="text-xs font-bold tracking-widest uppercase text-stone-500">
              Browse By Category
            </h3>

            <div className="flex flex-wrap gap-2.5">
              {CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <Link
                  key={cat}
                  to={`/browse?category=${cat}`}
                  className="px-5 py-2 rounded-full bg-white border border-stone-200 text-xs font-medium text-stone-700 hover:border-[#1B3B2B] hover:text-[#1B3B2B] transition-all shadow-sm"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </section>

        </main>
      </div>
    </>
  );
}