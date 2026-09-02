import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Navbar from "../../components/Navbar";
import { api } from "../../services/api";

const categories = ["Science", "Technology", "Environment", "Health", "History"];

export default function EditArticle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    category: "",
    tags: "",
    coverImage: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const response = await api.get(`/articles/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const article = response.data.data;
        setForm({
          title: article.title || "",
          category: article.category || "",
          tags: (article.tags || []).join(", "),
          coverImage: article.coverImage || "",
          content: article.content || "",
        });
      } catch (error) {
        console.error("Failed to fetch article:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem("authToken");

    try {
      setSaving(true);
      await api.patch(
        `/articles/${id}`,
        {
          title: form.title.trim(),
          category: form.category,
          tags: form.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          coverImage: form.coverImage.trim(),
          content: form.content.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigate("/profile");
    } catch (error) {
      console.error("Failed to update article:", error);
      alert(error.response?.data?.message || "Unable to update article.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F5F2EA] px-6 py-8 text-[#5a544d]">Loading article...</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="bg-[#F5F2EA] min-h-screen px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-[#1B3B2B]">Edit Article</h1>
              <p className="mt-1 text-stone-600">Update your draft and resubmit for admin review.</p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 text-stone-600 hover:text-black"
            >
              <FiArrowLeft />
              Back to profile
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border rounded-xl p-6">
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                type="text"
                className="w-full bg-[#EFEAE0] rounded-lg px-4 py-3 outline-none"
              />
            </div>

            <div className="bg-white border rounded-xl p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <input
                    value={form.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                    type="text"
                    placeholder="biology, medicine, genetics"
                    className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Poster URL</label>
                <input
                  value={form.coverImage}
                  onChange={(e) => handleChange("coverImage", e.target.value)}
                  type="url"
                  placeholder="https://example.com/article-poster.jpg"
                  className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Content</label>
                <textarea
                  value={form.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  rows="10"
                  placeholder="# Heading\n\nWrite with **bold text** and Markdown headings..."
                  className="w-full mt-2 bg-[#EFEAE0] rounded-lg px-4 py-3"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1d4b39] px-5 py-3 text-sm font-semibold text-white hover:bg-[#163e2f] disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save & Resubmit"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
