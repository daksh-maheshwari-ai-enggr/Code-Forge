import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Article",
      required: true,
      unique: true,
    },

    questions: [
      {
        questionText: {
          type: String,
          required: true,
        },

        options: [
          {
            type: String,
            required: true,
          },
        ],

        correctOptionIndex: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Quiz", quizSchema);