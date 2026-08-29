import { Link } from "react-router-dom";
import { FiEye } from "react-icons/fi";

export default function FeaturedHeroCard({ article }) {
  if (!article) return null;

  return (
    <Link
      to={`/read/${article.id}`}
      className="block w-full"
      aria-label={`Read ${article.title}`}
    >
      <div className="relative w-full rounded-2xl overflow-hidden min-h-[360px] md:min-h-[420px] flex items-end p-6 md:p-10 shadow-sm hover:shadow-md transition-shadow">
        {/* Background Image */}
        <img
          src={article.coverImage}
          alt={article.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 hover:scale-[1.02]"
        />

        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-[#D97706] text-white text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
              Featured
            </span>

            <span className="text-white/80 text-xs font-medium tracking-wide uppercase">
              {article.category}
            </span>
          </div>

          <h1 className="font-serif text-2xl md:text-4xl text-white font-bold leading-tight">
            {article.title}
          </h1>

          <p className="text-stone-300 text-sm md:text-base line-clamp-2 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex items-center gap-4 pt-2 text-stone-300 text-xs">
            <span className="font-medium text-white">
              {article.author.name}
            </span>

            <span>•</span>

            <span>{article.readTime}</span>

            <span>•</span>

            <span className="flex items-center gap-1">
              <FiEye className="w-3.5 h-3.5" />
              {article.views}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}