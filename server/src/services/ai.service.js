import { ChatGroq } from "@langchain/groq";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";
import { StateGraph, START, END } from "@langchain/langgraph";

// 1. Provider Abstraction
const getLLM = () => {
  const provider = process.env.LLM_PROVIDER || "groq";
  
  if (provider === "groq") {
    return new ChatGroq({
      apiKey: process.env.GROQ_API_KEY,
      model: process.env.GROQ_MODEL || "llama3-70b-8192",
      temperature: 0,
    });
  } else {
    // OpenRouter uses OpenAI SDK with custom baseURL
    return new ChatOpenAI({
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      apiKey: process.env.OPENROUTER_API_KEY,
      modelName: process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
      temperature: 0,
    });
  }
};

// 2. Structured Output Schema
const moderationSchema = z.object({
  riskScore: z.number().min(0).max(100).describe("A risk score from 0 to 100 based on the content's violation of community guidelines. 0 is perfectly safe, 100 is extremely dangerous/violating."),
  categories: z.array(z.string()).describe("Specific moderation categories like 'hate_speech', 'spam', 'harassment', 'nsfw'. Empty if none."),
  reason: z.string().describe("Explanation for the score and categories. Be concise."),
  confidence: z.number().min(0).max(1).describe("Confidence in this assessment (0.0 to 1.0)"),
});

// 3. State Definition for LangGraph
const moderationState = {
  content: {
    value: (x, y) => y ? y : x,
    default: () => "",
  },
  title: {
    value: (x, y) => y ? y : x,
    default: () => "",
  },
  aiAnalysis: {
    value: (x, y) => y ? y : x,
    default: () => null,
  },
  error: {
    value: (x, y) => y ? y : x,
    default: () => null,
  },
  finalResult: {
    value: (x, y) => y ? y : x,
    default: () => null,
  }
};

// 4. Graph Nodes
const validateInput = (state) => {
  let text = state.content || "";
  // Strip simple HTML tags for analysis
  text = text.replace(/<[^>]*>?/gm, "");
  
  // Truncate to avoid context window limits (rough estimate)
  if (text.length > 15000) {
    text = text.substring(0, 15000);
  }
  
  return { content: text };
};

const analyzeContent = async (state) => {
  try {
    const llm = getLLM();
    const structuredLlm = llm.withStructuredOutput(moderationSchema);
    
    const prompt = PromptTemplate.fromTemplate(
      `You are a strict community moderation AI. Analyze the following article for violations of safety guidelines (hate speech, spam, harassment, NSFW, illegal content).
      
      Article Title: {title}
      Article Content: {content}
      
      Assess the risk score from 0 (completely safe) to 100 (severe violation).
      Provide specific categories if flagged. Provide a short reason.`
    );
    
    const formattedPrompt = await prompt.format({
      title: state.title,
      content: state.content,
    });
    
    const response = await structuredLlm.invoke(formattedPrompt);
    return { aiAnalysis: response };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return { error: error.message };
  }
};

const determineSeverity = (state) => {
  // If AI failed, default to REVIEW with a medium score so a human looks at it
  if (state.error || !state.aiAnalysis) {
    return {
      finalResult: {
        riskScore: 50,
        severity: "MEDIUM",
        categories: ["ai_analysis_failed"],
        aiReason: "AI analysis failed to complete: " + (state.error || "Unknown error"),
        aiRecommendation: "REVIEW",
        aiConfidence: 0,
        modelProvider: process.env.LLM_PROVIDER || "groq"
      }
    };
  }
  
  const analysis = state.aiAnalysis;
  const score = analysis.riskScore || 0;
  
  let severity = "LOW";
  let recommendation = "APPROVE";
  
  // Application-controlled risk thresholds
  if (score > 70) {
    severity = "HIGH";
    recommendation = "BLOCK";
  } else if (score > 20) {
    severity = "MEDIUM";
    recommendation = "REVIEW";
  }
  
  return {
    finalResult: {
      riskScore: score,
      severity,
      categories: analysis.categories || [],
      aiReason: analysis.reason || "",
      aiRecommendation: recommendation,
      aiConfidence: analysis.confidence || 1,
      modelProvider: process.env.LLM_PROVIDER || "groq"
    }
  };
};

// 5. Build Graph
const buildGraph = () => {
  const workflow = new StateGraph({ channels: moderationState })
    .addNode("validate", validateInput)
    .addNode("analyze", analyzeContent)
    .addNode("severity", determineSeverity)
    .addEdge(START, "validate")
    .addEdge("validate", "analyze")
    .addEdge("analyze", "severity")
    .addEdge("severity", END);
    
  return workflow.compile();
};

export const scanContent = async (title, content) => {
  const app = buildGraph();
  const initialState = {
    title: title || "",
    content: content || "",
  };
  
  const finalState = await app.invoke(initialState);
  return finalState.finalResult;
};
