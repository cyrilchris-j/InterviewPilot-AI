import assert from "node:assert/strict";
import test from "node:test";
import { ConversationMemory } from "./conversationMemory.js";
import type { InterviewQuestion, InterviewTurn } from "../types/domain.js";

function makeQuestion(text: string, index = 1, day = 5): InterviewQuestion {
  return {
    id: `q-${index}-${day}`,
    index,
    text,
    day,
    dayTitle: "Vector Databases",
    objective: "Set up a local vector database",
    stage: "Warmup",
    type: "Concept",
    difficulty: "easy"
  };
}

function makeEvaluation(score: number, gaps: string[] = []): InterviewTurn["evaluation"] {
  return {
    correctness: score,
    depth: score,
    confidence: score,
    practicalUnderstanding: score,
    communication: score,
    reasoning: score,
    productionThinking: score,
    architectureThinking: score,
    score,
    verdict: score >= 4 ? "strong" : score >= 2.8 ? "mixed" : "weak",
    evidence: "evidence",
    followUpHint: "follow up",
    detectedStrengths: score >= 4 ? ["strong signal"] : [],
    detectedGaps: gaps
  };
}

function makeTurn(question: InterviewQuestion, answer: string, score: number, gaps: string[] = []): InterviewTurn {
  return {
    question,
    answer,
    evaluation: makeEvaluation(score, gaps)
  };
}

test("memory records topics, questions, answers, scores, mistakes, and history", () => {
  const memory = ConversationMemory.create("s1");
  assert.equal(memory.answeredCount, 0);

  memory.setCurrentTopic({ day: 5, dayTitle: "Vector Databases", objective: "Set up a vector DB", stage: "Warmup", questionType: "Concept", difficulty: "easy" });
  assert.equal(memory.currentTopic?.day, 5);

  const q1 = makeQuestion("How do embeddings work?");
  memory.recordQuestion(q1);
  assert.equal(memory.askedQuestions.length, 1);
  assert.equal(memory.hasAsked("HOW do embeddings  work?"), true);

  memory.recordTurn(q1, "I would use a model...", makeEvaluation(2.5, ["Surface-level"]));
  assert.equal(memory.answeredCount, 1);
  assert.equal(memory.scores.length, 1);
  assert.equal(memory.scores[0], 2.5);
  assert.equal(memory.mistakes.length, 1);
  assert.equal(memory.mistakes[0].gaps[0], "Surface-level");
  assert.equal(memory.history.length, 1);
  assert.equal(memory.latestTurn?.answer, "I would use a model...");
  assert.equal(memory.averageScore, 2.5);

  memory.recordTurn(makeQuestion("What is a collection?"), "Store vectors in a collection.", makeEvaluation(4.5));
  assert.equal(memory.mistakes.length, 1);
  assert.equal(memory.averageScore, 3.5);
});

test("memory prevents duplicate questions via normalized keys", () => {
  const memory = ConversationMemory.create("s2");
  const q1 = makeQuestion("Explain vector similarity search.");
  memory.recordQuestion(q1);
  memory.recordQuestion({ ...q1, text: "Explain vector similarity search!" });
  assert.equal(memory.hasAsked("explain vector similarity search"), true);
  assert.equal(memory.askedQuestions.length, 2);
  assert.equal(memory.askedQuestionKeys[0], memory.askedQuestionKeys[1]);
});

test("memory guards against repeated follow-ups on the same topic", () => {
  const memory = ConversationMemory.create("s3");
  assert.equal(memory.isFollowedUp("1"), false);
  memory.markFollowedUp("1");
  assert.equal(memory.isFollowedUp("1"), true);
  memory.markFollowedUp("1");
  assert.equal(memory.toState().followedUpTopicKeys.length, 1);
});

test("memory builds a follow-up context from the latest turn", () => {
  const memory = ConversationMemory.create("s4");
  memory.setCurrentTopic({ day: 10, dayTitle: "Retrieval", objective: "Trace retrieval", stage: "Scenario", questionType: "Debugging", difficulty: "medium" });
  const q1 = makeQuestion("How would you debug retrieval?", 1, 10);
  memory.recordQuestion(q1);
  memory.recordTurn(q1, "I would inspect traces.", makeEvaluation(2.5, ["No metric"]));

  const context = memory.getFollowUpContext();
  assert.ok(context);
  assert.equal(context.topic.day, 10);
  assert.equal(context.previousAnswer, "I would inspect traces.");
  assert.equal(context.previousEvaluation.score, 2.5);
  assert.equal(context.mistakes.length, 1);
  assert.equal(context.askedQuestions[0], "How would you debug retrieval?");
});

test("memory state survives serialization round-trip", () => {
  const memory = ConversationMemory.create("s5");
  memory.setCurrentTopic({ day: 5, dayTitle: "Vector Databases", objective: "Set up a vector DB", stage: "Warmup", questionType: "Concept", difficulty: "easy" });
  const q1 = makeQuestion("How do embeddings work?");
  memory.recordQuestion(q1);
  memory.recordTurn(q1, "Use a model.", makeEvaluation(2, ["Vague"]));
  memory.markFollowedUp("1");

  const restored = ConversationMemory.fromState(memory.toState());
  assert.equal(restored.sessionId, "s5");
  assert.equal(restored.answeredCount, 1);
  assert.equal(restored.hasAsked("how do embeddings work?"), true);
  assert.equal(restored.mistakes.length, 1);
  assert.equal(restored.isFollowedUp("1"), true);
  assert.equal(restored.latestTurn?.answer, "Use a model.");
});
