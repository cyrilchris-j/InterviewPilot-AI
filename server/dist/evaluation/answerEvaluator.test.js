import assert from "node:assert/strict";
import test from "node:test";
import { AnswerEvaluator } from "./answerEvaluator.js";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
const evaluator = new AnswerEvaluator();
const curriculum = new CurriculumRepository().getAll();
const candidate = new CandidateRepository().findById("CAND-003");
assert.ok(candidate);
const analysis = new CandidateAnalyzer(curriculum).analyze(candidate);
const day = curriculum.days.find((item) => item.day === 10) ?? curriculum.days[0];
const question = {
    id: "q-1-10",
    index: 1,
    text: "Walk me through loading knowledge base embeddings into the vector database.",
    day: day.day,
    dayTitle: day.title,
    objective: "Load knowledge base embeddings into the vector database",
    stage: "Scenario",
    type: "Scenario",
    difficulty: "medium"
};
test("returns the five required evaluation dimensions as integers 1-5", () => {
    const result = evaluator.evaluate(question, "First I would chunk the plans and claims, then generate embeddings for every chunk, monitor retrieval quality with an eval set, and roll back if latency regresses.", analysis);
    for (const dimension of [
        "correctness",
        "reasoning",
        "communication",
        "depth",
        "practicalUnderstanding"
    ]) {
        assert.equal(Number.isInteger(result[dimension]), true, `${dimension} should be an integer`);
        assert.ok(result[dimension] >= 1 && result[dimension] <= 5, `${dimension} out of range`);
    }
});
test("returns score, confidence, follow-up strategy, next action, weaknesses, and strengths", () => {
    const result = evaluator.evaluate(question, "I would trace the API boundary, check latency, and watch observability dashboards for drift.", analysis);
    assert.equal(typeof result.score, "number");
    assert.equal(typeof result.confidence, "number");
    assert.equal(typeof result.followUpHint, "string");
    assert.equal(result.followUpHint.length > 0, true);
    assert.equal(typeof result.nextAction, "string");
    assert.equal(Array.isArray(result.detectedStrengths), true);
    assert.equal(Array.isArray(result.detectedGaps), true);
    assert.ok(["strong", "mixed", "weak"].includes(result.verdict));
});
test("edge cases: empty answer scores weak and paths to re-ask", () => {
    const result = evaluator.evaluate(question, "", analysis);
    assert.equal(result.verdict, "weak");
    assert.match(result.nextAction, /re-ask/i);
    assert.ok(result.score >= 1 && result.score <= 5);
});
test("strong answer escalates in the next action", () => {
    const stellar = "I would load the knowledge base embeddings into the vector database via a pipeline, because a batch " +
        "load first, then verify every chunk is indexed, then test semantic search on an eval set, " +
        "compare results against the plain lookup, log the tool calls, measure latency, and if retrieval " +
        "drops I roll back to the previous index and trace a root cause across the database and the API.";
    const result = evaluator.evaluate(question, stellar, analysis);
    assert.equal(result.verdict, "strong");
    assert.match(result.nextAction, /escalate/i);
});
