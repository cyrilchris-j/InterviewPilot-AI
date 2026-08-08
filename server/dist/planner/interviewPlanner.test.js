import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
import { InterviewPlanner } from "./interviewPlanner.js";
const curriculum = new CurriculumRepository().getAll();
const analyzer = new CandidateAnalyzer(curriculum);
const planner = new InterviewPlanner();
function planFor(candidateId) {
    const candidate = new CandidateRepository().findById(candidateId);
    assert.ok(candidate);
    return planner.createPlan(analyzer.profile(candidate), curriculum);
}
test("plan contains a minimum of 8 questions", () => {
    const plan = planFor("CAND-003");
    assert.ok(plan.totalQuestions >= 8);
    assert.equal(plan.items.length, plan.totalQuestions);
});
test("plan reserves at least 4 distinct curriculum days", () => {
    const plan = planFor("CAND-010");
    assert.equal(plan.uniqueDays.length, plan.totalQuestions);
    assert.ok(plan.uniqueDays.length >= 4);
});
test("plan difficulty gradually increases across positions", () => {
    const plan = planFor("CAND-001");
    const difficulties = plan.items.map((item) => item.difficulty);
    const rank = { easy: 1, medium: 2, hard: 3 };
    for (let index = 1; index < difficulties.length; index += 1) {
        assert.ok(rank[difficulties[index]] >= rank[difficulties[index - 1]]);
    }
});
test("plan avoids duplicate topics", () => {
    const plan = planFor("CAND-014");
    assert.equal(new Set(plan.items.map((item) => item.day.day)).size, plan.items.length);
});
test("plan prioritizes completed missions and a first-try day leads the roadmap", () => {
    const candidate = new CandidateRepository().findById("CAND-001");
    assert.ok(candidate);
    const profile = analyzer.profile(candidate);
    const plan = planner.createPlan(profile, curriculum);
    assert.ok(profile.completedDays.includes(plan.roadmap[0].day));
    assert.ok(plan.items.filter((item) => item.day.day in profile.completedDays).length >= 1);
});
test("plan generates a structured roadmap", () => {
    const plan = planFor("CAND-003");
    assert.equal(plan.roadmap.length, plan.totalQuestions);
    assert.ok(plan.roadmap.every((step) => step.position >= 1 && step.day > 0));
    assert.ok(plan.roadmap.some((step) => step.stage === "Warmup"));
    assert.ok(plan.roadmap.some((step) => step.stage === "Reflection"));
    const first = plan.items[0];
    assert.equal(first.stage, "Warmup");
    assert.equal(first.questionType, "Concept");
    assert.ok(first.objective.length > 0);
    assert.ok(first.rationale.length > 0);
});
test("plan includes weak days with matching rationale", () => {
    const candidate = new CandidateRepository().findById("CAND-010");
    assert.ok(candidate);
    const profile = analyzer.profile(candidate);
    const plan = planner.createPlan(profile, curriculum);
    const rationales = plan.items.map((item) => item.rationale);
    assert.ok(rationales.some((text) => text.includes("probe")));
});
