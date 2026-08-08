import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { SessionManager } from "../sessions/sessionManager.js";
import { InterviewEngine } from "./interviewEngine.js";
function fakeAi(overrides = {}) {
    const question = overrides.question ?? {
        generate: async () => ({ text: "AI generated question about production AI systems." })
    };
    const evaluation = overrides.evaluation ?? {
        evaluate: async () => ({
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
        })
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
    const turn = await engine.answer("fallback-session", "I would trace the retrieval path, check metrics, and validate a fix.");
    assert.ok(turn.metrics?.latestScore);
    for (let index = 0; index < 7; index += 1) {
        await engine.answer("fallback-session", "I would trace, measure, and validate a production-safe fix.");
    }
    const done = await engine.answer("fallback-session", "Last answer.");
    assert.equal(done.done, true);
    assert.ok(done.feedback);
    assert.equal(done.feedback.summary.includes("AI summary"), false);
});
