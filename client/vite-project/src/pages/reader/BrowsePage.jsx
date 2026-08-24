import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSearch, FiBookOpen } from "react-icons/fi";
import { mockArticles, CATEGORIES } from "../../data/mockArticles";
import ArticleCard from "../../components/ArticleCard";
import Navbar from "../../components/Navbar";

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get("category") || "All";

  // State for our search bar and category pills
  const [selectedCategory, setSelectedCategory] = useState(initialCat);
  const [searchQuery, setSearchQuery] = useState("");

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    if (cat === "All") {
      searchParams.delete("category");
      setSearchParams(searchParams);
    } else {
      setSearchParams({ category: cat });
    }
  };

  // Filter the mock data dynamically
  const filteredArticles = mockArticles.filter((article) => {
    const matchesCategory =
      selectedCategory === "All" || article.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
    <Navbar />
    <div className="w-full text-stone-800 pb-16">
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Browse Articles
          </h1>
          <p className="text-stone-500 text-sm">
            Explore curated long-form writing across science, technology, and the world.
          </p>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles..."
              className="w-full pl-10 pr-4 py-2 rounded-full bg-white border border-stone-200 text-sm placeholder-stone-400 focus:outline-none focus:border-[#1B3B2B] shadow-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-[#1B3B2B] text-white shadow-sm"
                      : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid or Empty State */}
        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            {filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-3">
            <div className="w-12 h-12 text-stone-300 flex items-center justify-center">
              <FiBookOpen className="w-10 h-10 stroke-[1.5]" />
            </div>
            <p className="text-stone-400 text-sm font-medium">
              No articles match your search.
            </p>
          </div>
        )}
      </main>
    </div>
    </>
  );
}