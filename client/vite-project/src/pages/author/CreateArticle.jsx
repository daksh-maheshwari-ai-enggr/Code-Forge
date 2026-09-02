import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {api} from "../../services/api.js";

export default function CreateArticle() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [quizEnabled, setQuizEnabled] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    "Science",
    "Technology",
    "Environment",
    "Health",
    "History",
  ];

  const [questions, setQuestions] = useState([
    {
      questionText: "",
      options: ["", "", "", ""],
        correctIndex: -1,
    },
  ]);

  // ✅ Add unlimited question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctIndex: -1,
      },
    ]);
  };

  // ✅ Remove question
  const removeQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const updateQuestion = (index, value) => {
    const updated = [...questions];
    updated[index].questionText = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const selectCorrect = (qIndex, optIndex) => {
    const updated = [...questions];
    updated[qIndex].correctIndex = optIndex;
    setQuestions(updated);
  };

  const saveArticle = async (event, status) => {
    event.preventDefault();
    if (submitting) return;
    const token = localStorage.getItem("authToken");

    try {
      setSubmitting(true);
      if (status !== "DRAFT" && !title.trim()) {
        alert("Please enter article title.");
        return;
      }

      if (status !== "DRAFT" && !category) {
        alert("Please select a category.");
        return;
      }

      if (status !== "DRAFT" && !content.trim()) {
        alert("Please write article content.");
        return;
      }

        if (status !== "DRAFT" && quizEnabled && questions.some((question) => question.correctIndex < 0)) {
          alert("Please mark one correct option for every quiz question.");
          return;
        }

      // 1. Create Article
      const articleResponse = await api.post(
        "/articles",
        {
          title: title.trim(),
          category,
          tags: tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          coverImage: coverImage.trim(),
          content: content.trim(),
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const article = articleResponse.data.data;

      console.log("Article created:", article);

      // Quizzes are added when an article is submitted, not while it is incomplete.
      if (status !== "DRAFT" && quizEnabled) {
        await api.post(
          `/articles/${article._id}/quiz`,
          {
            questions: questions.map((question) => ({
              questionText: question.questionText.trim(),

              options: question.options.map((option) => option.trim()),

              correctOptionIndex: question.correctIndex,
            })),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }

      alert(status === "DRAFT" ? "Draft saved successfully!" : "Article submitted for review!");
      navigate("/profile");
      setTitle("");
      setCoverImage("");
      setContent("");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while creating the article.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#F5F2EA] min-h-screen px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* HEADER */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1B3B2B]">
                New Article
              </h1>
              <p className="text-stone-600 mt-1">
                Write your article and add a quiz before submitting for review.
              </p>
            </div>

            <button type="button" onClick={() => navigate("/profile")} className="flex items-center gap-2 text-stone-600 hover:text-black">
              <FiArrowLeft />
              Cancel
            </button>
          </div>

          {/* TITLE */}
          <div className="bg-white border rounded-xl p-6 mb-6">
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              type="text"
              placeholder="Enter your article title..."
              className="w-full bg-[#EFEAE0] rounded-lg px-4 py-3 outline-none"
            />
          </div>

          {/* CATEGORY + TAGS + CONTENT */}
          <div className="bg-white border rounded-xl p-6 mb-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* CATEGORY */}
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat, i) => (
                    <option key={i} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* TAGS */}
              <div>
                <label className="text-sm font-medium">
                  Tags (comma separated)
                </label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  type="text"
                  placeholder="biology, medicine, genetics"
                  className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Poster URL</label>
              <input
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                type="url"
                placeholder="https://example.com/article-poster.jpg"
                className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                placeholder="# Heading\n\nWrite with **bold text** and Markdown headings..."
                className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
              />
            </div>
          </div>

          {/* QUIZ */}
          <div className="bg-white border rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold">Add a Quiz</h2>
                <p className="text-sm text-stone-500">
                  Quizzes increase reader engagement significantly.
                </p>
              </div>

              <button
                onClick={() => setQuizEnabled(!quizEnabled)}
                className={`w-12 h-6 flex items-center rounded-full p-1 ${
                  quizEnabled ? "bg-green-700" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full transform ${
                    quizEnabled ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>

            {quizEnabled && (
              <div className="mt-6 space-y-6">
                {questions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="bg-[#F7F4EE] p-5 rounded-xl relative"
                  >
                    {/* REMOVE */}
                    {questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="absolute top-4 right-4 text-red-500"
                      >
                        <FiTrash2 />
                      </button>
                    )}

                    <p className="text-xs text-stone-500 mb-2">
                      QUESTION {qIndex + 1}
                    </p>

                    <input
                      value={q.questionText}
                      onChange={(e) => updateQuestion(qIndex, e.target.value)}
                      placeholder="Enter question..."
                      className="w-full bg-white rounded-lg px-4 py-3 mb-4"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      {q.options.map((opt, optIndex) => {
                        const isCorrect = q.correctIndex === optIndex;

                        return (
                          <div
                            key={optIndex}
                            onClick={() => selectCorrect(qIndex, optIndex)}
                            className={`cursor-pointer border rounded-lg px-3 py-2 flex items-center ${
                              isCorrect
                                ? "border-green-500 bg-green-50"
                                : "bg-white"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={isCorrect}
                              onChange={() => selectCorrect(qIndex, optIndex)}
                              className="mr-2 accent-green-700"
                            />
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) =>
                                updateOption(qIndex, optIndex, e.target.value)
                              }
                              placeholder={`Option ${optIndex + 1}`}
                              className="w-full outline-none bg-transparent"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {/* ADD QUESTION */}
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-2 text-green-700 font-medium"
                >
                  <FiPlus />
                  Add Question
                </button>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={(event) => saveArticle(event, "DRAFT")}
              disabled={submitting}
              className="px-6 py-3 border rounded-lg disabled:opacity-60"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={(event) => saveArticle(event, "PENDING_REVIEW")}
              className="px-6 py-3 bg-[#1B3B2B] text-white rounded-lg"
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
