import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FiCheckCircle, FiXCircle } from "react-icons/fi";
import { LuTrophy } from "react-icons/lu";

import Navbar from "../../components/Navbar";
import { quizData } from "../../data/quizData";

export default function QuizResultPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const quiz = quizData[id];

  if (!quiz) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#FBF8F3] flex items-center justify-center px-6">
          <p className="text-stone-500">Quiz results are unavailable.</p>
        </main>
      </>
    );
  }

  let answers = location.state?.answers;

  if (!answers) {
    try {
      answers = JSON.parse(
        localStorage.getItem(`quizAnswers-${id}`) || "[]",
      );
    } catch {
      answers = [];
    }
  }

  const questions = quiz.questions;

  const score = questions.reduce((total, question, index) => {
    return total + (answers[index] === question.answer ? 1 : 0);
  }, 0);

  const percentage = Math.round((score / questions.length) * 100);

  const getHeading = () => {
    if (percentage === 100) return "Excellent work!";
    return "Good effort!";
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FBF8F3] text-[#171411]">
        <section className="mx-auto w-full max-w-[680px] px-6 pb-16 pt-10">
          {/* Result Summary */}
          <div className="text-center">
            {/* Trophy */}
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#FFF1B8]">
              <LuTrophy
                className="h-[46px] w-[46px]"
                strokeWidth={2}
                color="#C56405"
              />
            </div>

            {/* Heading */}
            <h1 className="mt-7 font-serif text-[39px] font-bold leading-tight text-[#171411] md:text-[42px]">
              {getHeading()}
            </h1>

            {/* Score */}
            <p className="mt-3 text-[18px] text-stone-500">
              You scored {score} of {questions.length} ({percentage}%)
            </p>
          </div>

          {/* Score Progress */}
          <div className="mt-10 h-[10px] overflow-hidden rounded-full bg-[#E7E1D7]">
            <div
              className="h-full rounded-full bg-[#C47D32] transition-all duration-300"
              style={{
                width: `${percentage}%`,
              }}
            />
          </div>

          {/* Answer Review */}
          <div className="mt-12 space-y-5">
            {questions.map((question, index) => {
              const isCorrect =
                answers[index] === question.answer;

              return (
                <article
                  key={index}
                  className={`rounded-2xl border px-5 py-5 ${
                    isCorrect
                      ? "border-[#A8EBCF] bg-[#EDFFF7]"
                      : "border-[#FFCCCC] bg-[#FFF4F4]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status */}
                    <div className="mt-0.5 shrink-0">
                      {isCorrect ? (
                        <FiCheckCircle
                          className="h-[23px] w-[23px]"
                          color="#00A878"
                        />
                      ) : (
                        <FiXCircle
                          className="h-[23px] w-[23px]"
                          color="#FF3B30"
                        />
                      )}
                    </div>

                    {/* Question + Explanation */}
                    <div className="min-w-0 flex-1">
                      <h2 className="text-[16px] font-medium leading-[1.45] text-[#171411] md:text-[17px]">
                        {question.question}
                      </h2>

                      <p className="mt-2 text-[14px] leading-[1.55] text-stone-500">
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Back to Article */}
          <div className="mt-10 flex justify-center">
            <button
              type="button"
              onClick={() => navigate(`/read/${id}`)}
              className="rounded-lg bg-[#1B3B2B] px-8 py-3.5 text-[16px] font-semibold text-white transition-colors hover:bg-[#153124]"
            >
              Back to Article
            </button>
          </div>
        </section>
      </main>
    </>
  );
}