import assert from "node:assert/strict";
import test from "node:test";
import { QuestionGenerator } from "./questionGenerator.js";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { CandidateAnalyzer } from "../services/candidateAnalyzer.js";
const generator = new QuestionGenerator();
const curriculum = new CurriculumRepository().getAll();
const candidate = new CandidateRepository().findById("CAND-003");
assert.ok(candidate);
const analyzer = new CandidateAnalyzer(curriculum);
const analysis = analyzer.analyze(candidate);
function planItem(questionType, day = 10, difficulty = "medium") {
    const dayRecord = curriculum.days.find((item) => item.day === day) ?? curriculum.days[0];
    return {
        index: 1,
        stage: "Scenario",
        day: dayRecord,
        objective: dayRecord.objectives[0],
        questionType,
        difficulty,
        rationale: "Test fixture"
    };
}
function ask(questionType, overrides = {}) {
    const question = generator.generate(planItem(questionType), {
        candidate: analysis,
        askedKeys: new Set(),
        ...overrides
    });
    return question.text;
}
const GENERIC_PATTERNS = [
    /^What is /i,
    /^How would you explain/i,
    /^Define /i,
    /Explain X/i
];
test("generates each required question type with senior-interviewer phrasing", () => {
    const types = ["Scenario", "Architecture", "Debugging", "Production", "Follow-up"];
    for (const type of types) {
        const text = ask(type);
        assert.ok(text.length > 40, `${type} should be a substantive question, got: ${text}`);
        for (const pattern of GENERIC_PATTERNS) {
            assert.equal(pattern.test(text), false, `${type} must not look like a chatbot prompt: "${text}"`);
        }
    }
});
test("grounds questions in the curriculum day and the healthcare chatbot context", () => {
    const text = ask("Scenario", { candidate: analysis });
    assert.ok(text.includes("Day 10") || text.toLowerCase().includes("retrieval") || text.toLowerCase().includes("chatbot"), `expected curriculum-grounded scenario, got: ${text}`);
});
test("scaffolds weak-area candidates instead of demanding depth", () => {
    const weakAnalysis = {
        ...analysis,
        weakDays: [10]
    };
    const text = ask("Concept", { candidate: weakAnalysis });
    assert.ok(text.toLowerCase().includes("gap"), `expected scaffolding cue for weak day, got: ${text}`);
});
test("follow-up references the previous answer and evaluation", () => {
    const question = generator.followUp(planItem("Scenario"), {
        candidate: analysis,
        askedKeys: new Set(),
        previousEvaluation: {
            correctness: 2,
            depth: 2,
            confidence: 2,
            practicalUnderstanding: 2,
            communication: 2,
            reasoning: 2,
            productionThinking: 2,
            architectureThinking: 2,
            score: 2,
            verdict: "weak",
            evidence: "answer stayed surface-level",
            followUpHint: "Probe the first concrete step",
            detectedStrengths: [],
            detectedGaps: ["Surface-level"]
        },
        previousAnswer: "I would look at the logs and check metrics."
    });
    assert.ok(question.text.includes("You said"));
    assert.ok(question.text.toLowerCase().includes("first thing"));
});
test("shapes objectives into gerund phrases so questions read naturally", () => {
    const createItem = (objective, day = 10) => ({ ...planItem("Concept", day), objective });
    const askedKeys = new Set();
    const load = generator.generate(createItem("Load knowledge base embeddings into the vector database"), {
        candidate: analysis,
        askedKeys
    }).text;
    assert.ok(load.includes("loading knowledge base embeddings"), `expected gerund phrasing, got: ${load}`);
    const train = generator.generate(createItem("Train or fine-tune an LLM using LoRA", 15), {
        candidate: analysis,
        askedKeys
    }).text;
    assert.ok(train.includes("training or fine-tuning an LLM"), `expected paired gerunds, got: ${train}`);
});
test("never produces duplicate questions across a plan", () => {
    const askedKeys = new Set();
    const questions = Array.from({ length: 12 }, (_, index) => {
        const item = planItem(index % 2 === 0 ? "Scenario" : "Architecture", 10 + (index % 3), index % 2 === 0 ? "medium" : "hard");
        return generator.generate(item, { candidate: analysis, askedKeys }).text;
    });
    assert.equal(new Set(questions).size, questions.length);
});
