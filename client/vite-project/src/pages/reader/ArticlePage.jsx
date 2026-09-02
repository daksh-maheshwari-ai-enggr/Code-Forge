import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiThumbsUp,
  FiTag,
  FiHelpCircle,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import { getArticleById } from "../../services/api";

const renderInlineMarkdown = (text) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={index}>{part.slice(2, -2)}</strong>
    ) : (
      part
    ),
  );

const renderArticleContent = (content = "") =>
  content.split("\n").map((line, index) => {
    const trimmedLine = line.trim();
    const key = `${index}-${line}`;

    if (trimmedLine.startsWith("### ")) {
      return <h3 key={key} className="mt-7 text-2xl font-bold text-stone-900">{renderInlineMarkdown(trimmedLine.slice(4))}</h3>;
    }
    if (trimmedLine.startsWith("## ") || trimmedLine.startsWith("# ")) {
      const heading = trimmedLine.startsWith("## ") ? trimmedLine.slice(3) : trimmedLine.slice(2);
      return <h2 key={key} className="mt-8 text-3xl font-bold text-stone-900">{renderInlineMarkdown(heading)}</h2>;
    }
    return <p key={key} className={trimmedLine ? "min-h-[1.95em]" : "h-4"}>{renderInlineMarkdown(line)}</p>;
  });

export default function ArticlePage() {
  const { id } = useParams();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getArticleById(id);

        setArticle(response.data);
      } catch (error) {
        console.error("Failed to fetch article:", error);
        setError("Failed to load article.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#FBF8F3] text-[#1F1B18]">
          <div className="mx-auto max-w-[1008px] px-6 py-20 text-center text-stone-500">
            Loading article...
          </div>
        </main>
      </>
    );
  }

  if (error || !article) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#FBF8F3] text-[#1F1B18]">
          <div className="mx-auto max-w-[1008px] px-6 py-20 text-center">
            <p className="text-red-500">
              {error || "Article not found."}
            </p>

            <Link
              to="/browse"
              className="mt-5 inline-flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Browse
            </Link>
          </div>
        </main>
      </>
    );
  }

  const tags = article.tags || [];

  const authorName = article.author?.name || "Unknown Author";

  const summary =
    article.content?.length > 180
      ? `${article.content.slice(0, 180)}...`
      : article.content || "";

  const formattedDate = article.createdAt
    ? new Date(article.createdAt).toLocaleDateString()
    : "";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FBF8F3] text-[#1F1B18]">

        {/* ==================== ARTICLE HEADER ==================== */}
        <section className="mx-auto max-w-[1008px] px-6 pb-6 pt-11">

          <Link
            to="/browse"
            className="inline-flex items-center gap-2 text-[14px] text-stone-500 transition-colors hover:text-stone-800"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Metadata */}
          <div className="mt-10 flex flex-wrap items-center gap-3.5 text-[13px] leading-none">

            <span className="font-medium uppercase tracking-[0.04em] text-[#C9792B]">
              {article.category}
            </span>

            <span className="text-stone-300">•</span>

            {/* Temporary hardcoded read time */}
            <span className="text-stone-500">
              7 min read
            </span>

            <span className="text-stone-300">•</span>

            <span className="text-stone-500">
              {formattedDate}
            </span>

          </div>

          {/* Title */}
          <h1 className="font-editorial mt-7 max-w-[1000px] text-[39px] font-bold leading-[1.08] tracking-[-0.025em] text-[#171411] sm:text-[40px] md:text-[41px]">
            {article.title}
          </h1>

          {/* Subtitle / Preview */}
          <p className="mt-5 max-w-[900px] text-[17px] leading-[1.65] text-stone-500 md:text-[18px]">
            {summary}
          </p>

          {/* Author + Stats */}
          <div className="mt-7 flex items-center justify-between gap-6 border-y border-stone-200 py-4">

            <div className="flex min-w-0 items-center gap-3.5">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B3B2B] text-sm font-semibold text-[#D8E6DC]">
                {getInitials(authorName)}
              </div>

              <div className="min-w-0">

                <p className="text-[14px] font-semibold text-stone-900">
                  {authorName}
                </p>

                <p className="mt-0.5 text-[12px] leading-5 text-stone-500">
                  Author
                </p>

              </div>

            </div>

            <div className="flex shrink-0 items-center gap-5 text-[13px] text-stone-500">

              {/* Temporary hardcoded views */}
              <span className="flex items-center gap-1.5">
                <FiEye className="h-4 w-4" />
                0
              </span>

              {/* Temporary hardcoded likes */}
              <span className="flex items-center gap-1.5">
                <FiThumbsUp className="h-4 w-4" />
                0
              </span>

            </div>

          </div>

        </section>

        {/* ==================== HERO IMAGE ==================== */}
        <section className="mx-auto max-w-[1008px] px-6">

          {article.coverImage ? (
            <img
              src={article.coverImage}
              alt={article.title}
              className="h-[430px] w-full rounded-2xl object-cover md:h-[500px] lg:h-[520px]"
            />
          ) : null}

        </section>

        {/* ==================== ARTICLE BODY ==================== */}
        <article className="mx-auto max-w-[1008px] px-6 pb-8 pt-10">

          <div className="max-w-[900px] text-[17px] leading-[1.95] text-stone-700 md:text-[18px]">

            {/* Real article content from MongoDB */}
            <div>{renderArticleContent(article.content)}</div>

          </div>

          {/* ==================== TAGS ==================== */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2.5 pb-10 pt-9">

              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#F0ECE4] px-3.5 py-1.5 font-mono text-[13px] text-stone-700"
                >
                  <FiTag className="h-3.5 w-3.5" />
                  {tag}
                </span>
              ))}

            </div>
          )}

          {/* ==================== QUIZ CTA ==================== */}
          <section className="rounded-2xl bg-[#1B4330] px-6 py-11 text-center md:px-8 md:py-12">

            <FiHelpCircle className="mx-auto h-10 w-10 text-[#D8E0D8]" />

            <h2 className="font-editorial mt-5 text-[27px] font-bold text-white">
              Test Your Understanding
            </h2>

            <p className="mt-2 text-[15px] text-[#C8D7CE]">
              Test your knowledge about this article.
            </p>

            <Link
              to={`/read/${article._id}/quiz`}
              className="mt-7 inline-flex rounded-lg bg-[#CB8738] px-8 py-3 text-[15px] font-semibold text-white transition hover:bg-[#B9752C]"
            >
              Take the Quiz
            </Link>

          </section>

        </article>

      </main>
    </>
  );
}