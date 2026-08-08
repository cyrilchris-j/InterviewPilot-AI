import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { SessionManager } from "../sessions/sessionManager.js";
import { InterviewEngine } from "./interviewEngine.js";
import type { AiServices } from "../ai/index.js";
import type { AnswerEvaluation } from "../types/domain.js";

function baseEvaluation(): AnswerEvaluation {
  return {
    correctness: 4,
    depth: 4,
    confidence: 4,
    practicalUnderstanding: 4,
    communication: 4,
    reasoning: 4,
    productionThinking: 4,
    architectureThinking: 4,
    score: 4,
    verdict: "strong",
    evidence: "The answer referenced metrics and rollback planning.",
    followUpHint: "Probe failure modes under load.",
    detectedStrengths: ["Production-aware reasoning"],
    detectedGaps: ["No quantified latency target"]
  };
}

function fakeAi(overrides: Partial<AiServices> = {}): AiServices {
  const question = overrides.question ?? {
    generate: async () => ({ text: "AI generated question about production AI systems." })
  };
  const evaluation = overrides.evaluation ?? {
    evaluate: async () => baseEvaluation()
  };
  const feedback = overrides.feedback ?? {
    generate: async () => ({
      summary: "AI summary of the interview.",
      strengths: ["Clear reasoning"],
      gaps: ["Needs deeper architecture tradeoffs"],
      next: ["Practice timed mocks"],
      topicScores: [],
      recommendedDays: [],
      learningPath: [],
      overallRating: "Strong"
    })
  };
  return { question, evaluation, feedback };
}

test("engine uses AI question generation when AI services are provided", async () => {
  const engine = new InterviewEngine(new CurriculumRepository(), new SessionManager(120 * 60_000), fakeAi());
  const candidate = new CandidateRepository().findById("CAND-003");
  assert.ok(candidate);

  const start = await engine.start("ai-session", candidate);
  assert.equal(start.question?.text, "AI generated question about production AI systems.");
});

test("engine generates a follow-up on a weak answer and does not repeat it", async () => {
  const ai = fakeAi({
    evaluation: {
      evaluate: async () => ({ ...baseEvaluation(), score: 2, verdict: "weak" as const, detectedGaps: ["Vague"] })
    }
  });
  const engine = new InterviewEngine(new CurriculumRepository(), new SessionManager(120 * 60_000), ai);
  const candidate = new CandidateRepository().findById("CAND-003");
  assert.ok(candidate);

  const start = await engine.start("followup-session", candidate);
  assert.ok(start.question);

  const followUp = await engine.answer("followup-session", "Not really sure.");
  assert.equal(followUp.done, false);
  assert.ok(followUp.question);
  assert.equal(followUp.question.day, start.question.day);
  assert.notEqual(followUp.question.text, start.question.text);

  const next = await engine.answer("followup-session", "Still vague.");
  assert.ok(next.question);
  assert.notEqual(next.question.text, followUp.question.text);
});

test("engine prevents duplicate questions when AI repeats itself", async () => {
  const ai = fakeAi({
    question: {
      generate: async () => ({ text: "Identical question about embeddings." })
    }
  });
  const engine = new InterviewEngine(new CurriculumRepository(), new SessionManager(120 * 60_000), ai);
  const candidate = new CandidateRepository().findById("CAND-003");
  assert.ok(candidate);

  const start = await engine.start("dup-session", candidate);
  assert.equal(start.question?.text, "Identical question about embeddings.");

  const next = await engine.answer("dup-session", "I would inspect traces and metrics, then validate a fix.");
  assert.ok(next.question);
  assert.notEqual(next.question.text, "Identical question about embeddings.");
});

test("engine falls back to deterministic generators when AI services fail", async () => {
  const failing = fakeAi({
    question: { generate: async () => { throw new Error("boom"); } },
    evaluation: { evaluate: async () => { throw new Error("boom"); } },
    feedback: { generate: async () => { throw new Error("boom"); } }
  });

  const engine = new InterviewEngine(new CurriculumRepository(), new SessionManager(120 * 60_000), failing);
  const candidate = new CandidateRepository().findById("CAND-003");
  assert.ok(candidate);

  const start = await engine.start("fallback-session", candidate);
  assert.ok(start.question);
  assert.ok(start.question.text.length > 0);
  assert.notEqual(start.question.text, "AI generated question about production AI systems.");

  let latest = start;
  for (let attempts = 0; attempts < 25 && !latest.done; attempts += 1) {
    latest = await engine.answer("fallback-session", "I would trace the retrieval path, check metrics, and validate a fix.");
  }
  assert.equal(latest.done, true);
  assert.ok(latest.feedback);
  assert.equal(latest.feedback.summary.includes("AI summary"), false);
});
