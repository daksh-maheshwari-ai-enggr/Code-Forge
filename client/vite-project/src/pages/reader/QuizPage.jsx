import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCheck } from "react-icons/fi";

import Navbar from "../../components/Navbar";
import { quizData } from "../../data/quizData";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const quiz = quizData[id];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);

  if (!quiz) {
    return (
      <>
        <Navbar />

        <main className="min-h-screen bg-[#FBF8F3] flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-bold text-stone-900">
              Quiz Not Available
            </h1>

            <p className="mt-3 text-sm text-stone-500">
              There is no quiz configured for this article.
            </p>

            <Link
              to={`/read/${id}`}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#1B3B2B] px-6 py-3 text-sm font-semibold text-white"
            >
              <FiArrowLeft className="h-4 w-4" />
              Back to Article
            </Link>
          </div>
        </main>
      </>
    );
  }

  const question = quiz.questions[currentQuestion];
  const totalQuestions = quiz.questions.length;

  const answeredCount = answers.filter(Boolean).length;

  const progress =
    currentQuestion === 0
      ? 0
      : (currentQuestion / (totalQuestions - 1)) * 100;

  const handleSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!selectedAnswer) return;

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = selectedAnswer;

    setAnswers(updatedAnswers);

    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((previous) => previous + 1);

      setSelectedAnswer(
        updatedAnswers[currentQuestion + 1] || null
      );

      return;
    }

    localStorage.setItem(
      `quizAnswers-${id}`,
      JSON.stringify(updatedAnswers)
    );

    navigate(`/read/${id}/result`, {
      state: {
        answers: updatedAnswers,
      },
    });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#FBF8F3] text-[#171411]">
        <section className="mx-auto w-full max-w-[646px] px-6 pb-16 pt-11">
          {/* Back */}
          <Link
            to={`/read/${id}`}
            className="inline-flex items-center gap-2 text-[15px] text-stone-500 transition-colors hover:text-[#1B3B2B]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back to Article
          </Link>

          {/* Progress Header */}
          <div className="mt-10">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-medium uppercase tracking-[0.16em] text-stone-600">
                Question {currentQuestion + 1} of {totalQuestions}
              </span>

              <span className="text-[13px] text-stone-500">
                {answeredCount} answered
              </span>
            </div>

            <div className="mt-3 h-[6px] overflow-hidden rounded-full bg-[#E8E2D8]">
              <div
                className="h-full rounded-full bg-[#C47D32] transition-all duration-300"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          {/* Question Card */}
          <section className="mt-11 rounded-2xl border border-stone-200 bg-white px-10 py-10">
            <h1 className="font-serif text-[25px] font-bold leading-[1.25] text-[#171411]">
              {question.question}
            </h1>

            {/* Options */}
            <div className="mt-9 space-y-3.5">
              {question.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const letter = String.fromCharCode(65 + index);

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`w-full rounded-xl border px-5 py-4 text-left transition-colors ${
                      isSelected
                        ? "border-[#AAB4AC] bg-[#F0F3EF]"
                        : "border-stone-200 bg-[#FBF8F3] hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-full border text-[13px] ${
                          isSelected
                            ? "border-[#547060] text-[#1B3B2B]"
                            : "border-stone-700 text-stone-800"
                        }`}
                      >
                        {letter}
                      </span>

                      <span className="text-[15px] leading-6 text-stone-800">
                        {option}
                      </span>

                      {isSelected && (
                        <FiCheck className="ml-auto h-4 w-4 shrink-0 text-[#365A48]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Action */}
          <button
            type="button"
            onClick={handleNext}
            disabled={!selectedAnswer}
            className={`mt-7 w-full rounded-lg py-[15px] text-[16px] font-semibold transition-colors ${
              selectedAnswer
                ? "bg-[#1B3B2B] text-white hover:bg-[#153124]"
                : "cursor-not-allowed bg-[#A8AEA9] text-white"
            }`}
          >
            {currentQuestion === totalQuestions - 1
              ? "Submit Quiz"
              : "Next Question"}
          </button>
        </section>
      </main>
    </>
  );
}