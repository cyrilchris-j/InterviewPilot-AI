import assert from "node:assert/strict";
import test from "node:test";
import { CurriculumRepository } from "../curriculum/curriculumRepository.js";
import { CandidateRepository } from "../candidate/candidateRepository.js";
import { SessionManager } from "../sessions/sessionManager.js";
import { InterviewEngine } from "./interviewEngine.js";

test("mock interview completes after eight answers and covers at least four days", () => {
  const engine = new InterviewEngine(new CurriculumRepository(), new SessionManager(120 * 60_000));
  const candidate = new CandidateRepository().findById("CAND-003");
  assert.ok(candidate);
  const start = engine.start("test-session", candidate);
  assert.equal(start.done, false);

  let latest = start;
  for (let index = 0; index < 8; index += 1) {
    latest = engine.answer(
      "test-session",
      "I would identify the objective, inspect traces and metrics, compare retrieval or generation outputs, validate with tests, and then choose a production-safe fix with monitoring."
    );
  }

  assert.equal(latest.done, true);
  assert.ok(latest.feedback);
  assert.ok((latest.progress?.coveredDays.length ?? 0) >= 4);
  assert.equal(latest.feedback.strengths.length > 0, true);
  assert.equal(latest.feedback.gaps.length > 0, true);
  assert.equal(latest.feedback.next.length > 0, true);
});
