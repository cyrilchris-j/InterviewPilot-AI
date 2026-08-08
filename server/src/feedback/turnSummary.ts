import type { Feedback, InterviewTurn } from "../types/domain.js";
import { unique } from "../utils/text.js";

export type TurnSummary = {
  topicScores: Feedback["topicScores"];
  recommendedDays: number[];
  learningPath: string[];
};

const WEAK_TURN_LIMIT = 3;

/** Map from curriculum day → concrete action verb for learning path items */
const DAY_ACTIONS: Record<number, string> = {
  1: "set up a clean Python virtual environment and verify the toolchain",
  2: "run a local LLM with Ollama and build a simple chat loop",
  3: "scaffold a FastAPI backend and connect a React frontend via REST",
  4: "load a CSV dataset into SQLite and write SQL queries against it",
  5: "extract text from PDFs and unstructured documents using pdfplumber",
  6: "chunk documents with LangChain splitters and build a knowledge base",
  7: "generate embeddings with Sentence Transformers and visualize clusters",
  8: "set up a ChromaDB collection and compare it against Pinecone",
  9: "populate a vector database and evaluate semantic search quality",
  10: "build a hybrid retrieval router combining SQL and vector search",
  11: "connect a retrieval engine to an LLM to complete a RAG pipeline",
  12: "write and compare three system prompts measuring accuracy and tone",
  13: "define function schemas and test LLM tool selection with edge cases",
  14: "create a fine-tuning dataset and justify when fine-tuning beats RAG",
  15: "fine-tune a model with LoRA and measure quality vs the base model",
  16: "build a /chat API endpoint with session management in FastAPI",
  17: "create a Streamlit chat interface connected to the backend API",
  18: "add Server-Sent Events streaming to the LLM response pipeline",
  19: "add citations, structured cards, and Markdown rendering to responses",
  20: "persist conversation history and implement automatic summarization",
  21: "wrap chatbot tools as LangChain agents and trace the reasoning loop",
  22: "implement a router agent that delegates to specialist agents using CrewAI",
  23: "build an MCP server exposing chatbot tools and verify live interactions",
  24: "integrate agents, MCP tools, and retrieval into one agentic pipeline",
  25: "create a benchmark dataset and measure retrieval and response quality",
  26: "profile token usage and optimize prompt size and response caching",
  27: "add input validation, prompt-injection safeguards, and API security",
  28: "containerize the backend and frontend with Docker and deploy to Kubernetes",
  29: "add structured logging and Prometheus metrics to the FastAPI backend",
  30: "run end-to-end tests, fix production issues, and document the deployment",
  31: "present the complete pipeline end-to-end with retrieval, agents, and MCP"
};

export function summarizeTurns(turns: readonly InterviewTurn[]): TurnSummary {
  const weakerTurns = [...turns]
    .sort((a, b) => a.evaluation.score - b.evaluation.score)
    .slice(0, WEAK_TURN_LIMIT);

  const topicScores = turns.map((turn) => ({
    topic: turn.question.dayTitle,
    day: turn.question.day,
    score: turn.evaluation.score
  }));

  const recommendedDays = unique(weakerTurns.map((turn) => turn.question.day));

  const learningPath = recommendedDays.map((day) => {
    const turn = weakerTurns.find((item) => item.question.day === day);
    const title = turn?.question.dayTitle ?? "Curriculum Topic";
    const action = DAY_ACTIONS[day] ?? `review the curriculum objectives and complete a hands-on exercise`;
    return `Day ${day} — ${title}: Practice how to ${action}.`;
  });

  return { topicScores, recommendedDays, learningPath };
}
