import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "./curriculumRepository.js";
import { CurriculumEngine } from "./curriculumEngine.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";

const curriculum = new CurriculumRepository().getAll();
const engine = new CurriculumEngine(new CurriculumRepository());
const candidates = new CandidateRepository();

test("getDay returns the day and throws for unknown days", () => {
  const day = engine.getDay(1);
  assert.equal(day.day, 1);
  assert.equal(day.title, "VS Code & Python Environment Setup");

  assert.throws(() => engine.getDay(999), /not found/);
});

test("getModule and getModuleForDay resolve dynamically", () => {
  const module = engine.getModule(3);
  assert.equal(module.title, "Embeddings & Vector Search");
  assert.deepEqual(engine.getModuleForDay(9), module);

  assert.throws(() => engine.getModule(99), /not found/);
  assert.equal(engine.getModuleForDay(999), undefined);
});

test("getObjectives and getTools return curriculum data", () => {
  const objectives = engine.getObjectives(12);
  assert.ok(objectives.length >= 5);
  assert.ok(objectives.some((objective) => objective.includes("prompt")));

  const tools = engine.getTools(28);
  assert.ok(tools.includes("Docker"));
});

test("getCompletedTopics returns only passed days with completed status", () => {
  const candidate = candidates.findById("CAND-003");
  assert.ok(candidate);

  const topics = engine.getCompletedTopics(candidate);
  assert.equal(topics.length, candidate.missions.filter((mission) => mission.passed).length);
  assert.ok(topics.every((topic) => topic.status === "completed"));
  assert.ok(topics.some((topic) => topic.day === 31));
});

test("getNextTopics skips completed days and surfaces skipped days first", () => {
  const candidate = candidates.findById("CAND-014");
  assert.ok(candidate);

  const topics = engine.getNextTopics(candidate, { limit: 3 });
  assert.deepEqual(topics.map((topic) => topic.day), [28, 8, 22]);
  assert.ok(topics.every((topic) => topic.status !== "completed"));
});

test("getNextTopics honors prioritize, excludeDays, and includeCompleted", () => {
  const candidate = candidates.findById("CAND-010");
  assert.ok(candidate);

  const prioritized = engine.getNextTopics(candidate, { prioritize: [10], limit: 2 });
  assert.equal(prioritized[0].day, 10);

  const excluded = engine.getNextTopics(candidate, { excludeDays: [10, 22, 27], limit: 1 });
  assert.notEqual(excluded[0].day, 10);
  assert.notEqual(excluded[0].day, 22);
  assert.notEqual(excluded[0].day, 27);

  const withoutCompleted = engine.getNextTopics(candidate, { limit: 31 });
  assert.ok(withoutCompleted.every((topic) => topic.status !== "completed"));

  const withCompleted = engine.getNextTopics(candidate, { includeCompleted: true, limit: 31 });
  assert.ok(withCompleted.some((topic) => topic.status === "completed"));
});

test("getQuestionPool builds one item per objective with no hardcoding", () => {
  const pool = engine.getQuestionPool();
  const expectedCount = curriculum.days.reduce((sum, day) => sum + day.objectives.length, 0);

  assert.equal(pool.length, expectedCount);
  assert.ok(pool.some((item) => item.day === 1));
  assert.ok(pool.some((item) => item.day === 31));
  assert.ok(pool.every((item) => item.objective.length > 0));
});

test("getQuestionPool filters by day, module, and limit", () => {
  const edgePool = engine.getQuestionPool({ dayNumbers: [1, 31], limit: 2 });
  assert.deepEqual(edgePool.map((item) => item.day), [1, 1]);

  const modulePool = engine.getQuestionPool({ moduleNumber: 3 });
  assert.ok(modulePool.every((item) => item.module === "Embeddings & Vector Search"));
  assert.ok(modulePool.every((item) => item.day >= 7 && item.day <= 10));
});

test("getQuestionPool difficulty scales with module position", () => {
  const pool = engine.getQuestionPool({ dayNumbers: [1, 31] });
  const first = pool.find((item) => item.day === 1);
  const last = pool.find((item) => item.day === 31);

  assert.equal(first?.difficulty, "easy");
  assert.equal(last?.difficulty, "hard");
});
