import { Link, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiEye,
  FiThumbsUp,
  FiTag,
  FiHelpCircle,
} from "react-icons/fi";

import Navbar from "../../components/Navbar";
import { mockArticles } from "../../data/mockArticles";

export default function ArticlePage() {
  const { id } = useParams();

  const article =
    mockArticles.find((item) => item.id === id) || mockArticles[1];

  const tags = ["history", "internet", "computing"];

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

            <span className="text-stone-500">
              {article.readTime}
            </span>

            <span className="text-stone-300">•</span>

            <span className="text-stone-500">
              {article.date}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-editorial mt-7 max-w-[1000px] text-[39px] font-bold leading-[1.08] tracking-[-0.025em] text-[#171411] sm:text-[40px] md:text-[41px]">
            {article.title}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 max-w-[900px] text-[17px] leading-[1.65] text-stone-500 md:text-[18px]">
            {article.summary}
          </p>

          {/* Author + Stats */}
          <div className="mt-7 flex items-center justify-between gap-6 border-y border-stone-200 py-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1B3B2B] text-sm font-semibold text-[#D8E6DC]">
                {article.author.initials}
              </div>

              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-stone-900">
                  {article.author.name}
                </p>

                <p className="mt-0.5 text-[12px] leading-5 text-stone-500">
                  {article.author.bio}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-5 text-[13px] text-stone-500">
              <span className="flex items-center gap-1.5">
                <FiEye className="h-4 w-4" />
                {article.views}
              </span>

              <span className="flex items-center gap-1.5">
                <FiThumbsUp className="h-4 w-4" />
                {article.likes}
              </span>
            </div>
          </div>
        </section>

        {/* ==================== HERO IMAGE ==================== */}
        <section className="mx-auto max-w-[1008px] px-6">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-[430px] w-full rounded-2xl object-cover md:h-[500px] lg:h-[520px]"
          />
        </section>

        {/* ==================== ARTICLE BODY ==================== */}
        <article className="mx-auto max-w-[1008px] px-6 pb-8 pt-10">
          <div className="max-w-[900px] text-[17px] leading-[1.95] text-stone-700 md:text-[18px]">
            <p>
              The message was supposed to be "login." What arrived, 400 miles
              away at the Stanford Research Institute, was "lo."
            </p>

            <p className="mt-6">
              Then the system crashed.
            </p>

            <p className="mt-6">
              It was 10:30 p.m. on October 29, 1969, and in that brief, broken
              transmission, the ARPANET had said its first word.
            </p>

            <p className="mt-6">
              The modern internet – the thing you are reading this on – traces
              its lineage to that stutter.
            </p>

            <section className="mt-12">
              <h2 className="font-editorial text-[29px] font-bold leading-[1.2] text-[#171411]">
                Why ARPANET Existed
              </h2>

              <p className="mt-5">
                The Advanced Research Projects Agency Network was not built to
                survive nuclear war, despite the myth. It was built to let
                university researchers share computing resources – the
                ARPA-funded time-sharing systems that existed, expensive and
                scattered, at a handful of institutions.
              </p>

              <p className="mt-7">
                The key innovation was packet switching: instead of dedicating a
                circuit to a conversation (as telephone networks did), ARPANET
                broke data into discrete packets, sent them independently, and
                reassembled them at the destination. No single point of
                failure. No reserved bandwidth. Just packets, finding their
                way.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="font-editorial text-[29px] font-bold leading-[1.2] text-[#171411]">
                The Nodes
              </h2>

              <p className="mt-5">
                By the end of 1969, four nodes existed: UCLA, Stanford Research
                Institute, UC Santa Barbara, and the University of Utah. Each
                ran an Interface Message Processor – a dedicated minicomputer
                built by Bolt Beranek and Newman – that handled the packet
                routing so the host machines didn't have to.
              </p>

              <p className="mt-7">
                By 1971, there were 15 nodes. By 1973, the network had crossed
                the Atlantic. By 1983, the protocol had changed – TCP/IP
                replaced the original NCP – and what had been ARPANET was
                becoming something bigger than its architects imagined.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="font-editorial text-[29px] font-bold leading-[1.2] text-[#171411]">
                What They Got Wrong
              </h2>

              <p className="mt-5">
                The designers of ARPANET optimized for resilience and resource
                sharing. They did not design for scale, for commerce, for
                anonymity, for mass surveillance, or for the particular social
                dynamics that emerge when three billion humans interact
                continuously through a shared medium.
              </p>

              <p className="mt-7">
                This is not a criticism. It is a reminder. The infrastructure
                we inherited was built for a world of trusted research nodes.
                The world it now serves is considerably stranger.
              </p>
            </section>

            <section className="mt-12">
              <h2 className="font-editorial text-[29px] font-bold leading-[1.2] text-[#171411]">
                A Network Becomes a Medium
              </h2>

              <p className="mt-5">
                The transformation from ARPANET to internet to web happened in
                stages, each adding a layer of abstraction. TCP/IP standardized
                the transport. DNS gave machines names humans could read. HTTP
                gave documents addresses. The browser gave those documents
                windows.
              </p>

              <p className="mt-7">
                The rest is the particular texture of the world you live in now
                – the feeds, the searches, the messages, the commerce – built
                on a foundation laid by a crash and a two-letter word.
              </p>
            </section>
          </div>

          {/* ==================== TAGS ==================== */}
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

          {/* ==================== QUIZ CTA ==================== */}
          <section className="rounded-2xl bg-[#1B4330] px-6 py-11 text-center md:px-8 md:py-12">
            <FiHelpCircle className="mx-auto h-10 w-10 text-[#D8E0D8]" />

            <h2 className="font-editorial mt-5 text-[27px] font-bold text-white">
              Test Your Understanding
            </h2>

            <p className="mt-2 text-[15px] text-[#C8D7CE]">
              The Early Internet – Fact or Fiction? – 2 questions
            </p>

            <Link
              to={`/read/${article.id}/quiz`}
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