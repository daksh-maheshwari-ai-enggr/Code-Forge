import { Link } from "react-router-dom";
import { FiEye, FiThumbsUp } from "react-icons/fi";

export default function ArticleCard({ article }) {
  const DEFAULT_COVER_IMAGE =
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80";
  return (
    <Link
      to={`/read/${article._id}`}
      className="block h-full"
      aria-label={`Read ${article.title}`}
    >
      <article className="bg-white rounded-2xl overflow-hidden border border-stone-200/70 hover:border-stone-300 transition-all flex flex-col h-full shadow-sm hover:shadow-md">
        {/* Top Image */}
        <div className="relative h-48 w-full overflow-hidden bg-stone-100">
          <img
            src={article.coverImage || DEFAULT_COVER_IMAGE}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>

        {/* Text Content */}
        <div className="p-5 flex flex-col flex-grow justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider uppercase text-[#C26D2B]">
              <span>{article.category}</span>
              <span className="text-stone-300">•</span>
              <span className="text-stone-400 font-normal lowercase">
                {article.readTime}
              </span>
            </div>

            <h3 className="font-serif font-bold text-lg text-stone-900 leading-snug line-clamp-2">
              {article.title}
            </h3>

            <p className="text-stone-500 text-xs leading-relaxed line-clamp-2">
              {article.summary}
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-500 mt-auto">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#1B3B2B] text-[#D8E6DC] flex items-center justify-center text-[10px] font-bold">
                {article.author.initials}
              </div>

              <span className="font-medium text-stone-700">
                {article.author.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FiEye className="w-3.5 h-3.5" />
                {article.views}
              </span>

              <span className="flex items-center gap-1">
                <FiThumbsUp className="w-3.5 h-3.5" />
                {article.likes}
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
