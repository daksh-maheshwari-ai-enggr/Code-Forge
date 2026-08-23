import { Link } from "react-router-dom";
import { mockArticles, CATEGORIES } from "../data/mockArticles";
import FeaturedHeroCard from "../components/FeaturedHeroCard";
import ArticleCard from "../components/ArticleCard";

export default function HomePage() {
  // Grab the first featured article, and use the rest for the recent grid
  const featuredArticle = mockArticles.find((a) => a.isFeatured) || mockArticles[0];
  const recentArticles = mockArticles.filter((a) => a.id !== featuredArticle?.id);

  return (
    <div className="w-full text-stone-800 pb-16">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-12">
        {/* Featured Hero Section */}
        <FeaturedHeroCard article={featuredArticle} />

        {/* Recent Articles Section */}
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
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

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
  );
}