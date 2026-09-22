import dotenv from "dotenv";
import { ChatPromptTemplate } from "@langchain/core/prompts";

dotenv.config();

const prompt = ChatPromptTemplate.fromMessages([
  [
    "system",
    `You are a spam and abuse detection system for a content platform.

Analyze the user's comment and classify it into exactly one category:

NORMAL
SPAM
ABUSIVE
SUSPICIOUS

Check for:
- Repeated or promotional spam
- Suspicious links
- Excessive unwanted advertising
- Abusive or insulting language
- Attempts to manipulate or deceive users
- Normal genuine discussion

Return ONLY valid JSON in this exact format:
{{
  "label": "NORMAL",
  "riskScore": 0,
  "reason": "short reason"
}}

The riskScore must be a number from 0 to 100.`,
  ],
  ["human", "Comment: {comment}"],
]);

export const detectSpam = async (comment) => {
  if (!comment || !comment.trim()) {
    throw new Error("Comment is required for spam detection");
  }

  const formattedMessages = await prompt.formatMessages({
    comment: comment.trim(),
  });

  const messages = formattedMessages.map((message) => ({
    role: message._getType() === "system" ? "system" : "user",
    content: message.content,
  }));

  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL,
        messages,
        temperature: 0,
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `OpenRouter API error (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();

  const content = data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter returned an empty AI response");
  }

  return content;
};