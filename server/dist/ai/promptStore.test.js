import assert from "node:assert/strict";
import test from "node:test";
import { PromptStore } from "./promptStore.js";
const prompts = new PromptStore();
test("renders a prompt template and leaves no unresolved placeholders", () => {
    const rendered = prompts.render("question", {
        candidateProfile: "{}",
        dayNumber: "3",
        dayTitle: "RAG",
        dayType: "Lecture",
        objectives: "Build a retriever",
        tools: "OpenAI",
        stage: "Warmup",
        questionType: "Concept",
        difficulty: "easy",
        objective: "Build a retriever",
        previousEvaluation: "(none)",
        previousAnswer: "(none)",
        askedQuestions: "(none)"
    });
    assert.ok(rendered.includes("Day 3: RAG"));
    assert.equal(rendered.includes("{{"), false);
});
test("throws when a template references an unknown variable", () => {
    assert.throws(() => prompts.render("evaluation", { missing: "x" }), /references unknown variable "\{\{candidateProfile\}\}"/);
});
test("loads the system prompt without variables", () => {
    const system = prompts.load("system");
    assert.ok(system.includes("senior engineering interviewer"));
});
test("throws when the prompt file does not exist", () => {
    assert.throws(() => prompts.render("does-not-exist"), /Prompt file not found/);
});
