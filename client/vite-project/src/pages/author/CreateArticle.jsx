import { useState } from "react";
import { FiArrowLeft, FiPlus, FiTrash2 } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../context/AuthContext";
import {api} from "../../services/api.js";

export default function CreateArticle() {
  const { user } = useAuth();

  const [quizEnabled, setQuizEnabled] = useState(true);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");

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
      correctIndex: 0,
    },
  ]);

  // ✅ Add unlimited question
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctIndex: 0,
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      if (!title.trim()) {
        alert("Please enter article title.");
        return;
      }

      if (!category) {
        alert("Please select a category.");
        return;
      }

      if (!content.trim()) {
        alert("Please write article content.");
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
          content: content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const article = articleResponse.data.data;

      console.log("Article created:", article);

      // 2. Create Quiz if enabled
      if (quizEnabled) {
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

      alert("Article created successfully!");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.message ||
          "Something went wrong while creating the article.",
      );
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

            <button className="flex items-center gap-2 text-stone-600 hover:text-black">
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

            {/* CONTENT */}
            <div>
              <label className="text-sm font-medium">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows="6"
                placeholder="Write your article here..."
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
            <button className="px-6 py-3 border rounded-lg">Save Draft</button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#1B3B2B] text-white rounded-lg"
            >
              Submit for Review
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
