import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "./candidateRepository.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
const analyzer = new CandidateAnalyzer(new CurriculumRepository().getAll());
const repository = new CandidateRepository();
test("top candidate gets high confidence, hard difficulty, and first-try strengths", () => {
    const candidate = repository.findById("CAND-003");
    assert.ok(candidate);
    const analysis = analyzer.analyze(candidate);
    assert.equal(analysis.confidence, 10);
    assert.equal(analysis.difficulty, "hard");
    assert.ok(analysis.strengths.length >= 3);
    assert.equal(analysis.weaknesses.length, 1);
    assert.ok(analysis.weaknesses[0].includes("No skipped or failed modules"));
    assert.ok(analysis.strongDays.includes(7));
    assert.ok(analysis.completedDays.includes(31));
});
test("struggling candidate gets failed/skipped weaknesses and easier difficulty", () => {
    const candidate = repository.findById("CAND-010");
    assert.ok(candidate);
    const analysis = analyzer.analyze(candidate);
    assert.equal(analysis.difficulty, "easy");
    assert.ok(analysis.confidence <= 6);
    assert.ok(analysis.weaknesses.some((item) => item.includes("not completed")));
    assert.ok(analysis.weakDays.includes(8));
    assert.ok(analysis.recommendedTopics.length > 0);
});
test("skipped days appear in skippedDays and module progress", () => {
    const candidate = repository.findById("CAND-014");
    assert.ok(candidate);
    const analysis = analyzer.analyze(candidate);
    assert.ok(analysis.skippedDays.includes(8));
    assert.ok(analysis.riskNotes.length > 0);
});
test("strong candidate outscores weak candidate on overall algorithm", () => {
    const strong = analyzer.analyze(repository.findById("CAND-003"));
    const weak = analyzer.analyze(repository.findById("CAND-010"));
    const scoreOf = (analysis) => analysis.confidence * 10;
    assert.ok(scoreOf(strong) > scoreOf(weak));
});
