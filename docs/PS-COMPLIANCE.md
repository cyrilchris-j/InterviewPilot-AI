# PS-COMPLIANCE.md — ABTalks Hackathon Problem Statement Compliance Audit

**Product**: InterviewPilot AI  
**Problem Statement**: "The Interview Agent" — ABTalks Vibe Code Hackathon  
**Audit Date**: 2026-08-08  
**Auditor**: Principal Engineer (automated trace of runtime behavior)

---

## Methodology

Every requirement was traced through the actual runtime call chain, not inferred from file existence.
Each runtime path is cited with the actual file and function name.

---

## Compliance Table

| # | Requirement | Current Implementation | File / Location | Status | Problem | Required Fix |
|---|---|---|---|---|---|---|
| 1 | **Conduct a conversational technical interview** | `InterviewEngine.start()` returns first question; `InterviewEngine.answer()` processes each candidate response and returns next question. Conversation is maintained across HTTP turns via `ConversationMemory`. | `server/src/interview/interviewEngine.ts:60,118` | **PASS** | None | None |
| 2 | **Interview must be personalized to the candidate's learning journey** | `CandidateAnalyzer.analyze()` builds a `CandidateAnalysis` from missions (passed/skipped/attempts/signals). `InterviewPlanner.createPlan()` receives `CandidateProfile` and selects curriculum days prioritising strength days, then weak areas, then completed days. Every `PlanItem` includes a `rationale` string traceable to the candidate record. | `server/src/services/candidateAnalyzer.ts:21`, `server/src/planner/interviewPlanner.ts:67,110` | **PASS** | None | None |
| 3 | **Ask a minimum of 8 questions** | `PLAN_SIZE = 8` is a hard constant in `InterviewPlanner`. `assertInDays()` throws if fewer than 8 items are produced. The engine guards on `session.currentIndex >= session.plan.totalQuestions - 1` before marking done. Follow-up questions are additive (they do not consume plan slots). | `server/src/planner/interviewPlanner.ts:16`, `server/src/interview/interviewEngine.ts:135` | **PASS** | None | None |
| 4 | **Cover at least 4 different curriculum days** | `MIN_DISTINCT_DAYS = 4` constant enforced in `assertInDays()`. `InterviewPlanner.selectDays()` produces 8 entries drawn from distinct curriculum days, typically 6–8 unique days for a normal candidate profile. | `server/src/planner/interviewPlanner.ts:17,130-137` | **PASS** | None | None |
| 5 | **Generate follow-up questions based on previous responses** | When `evaluation.verdict === "weak"` and the topic has not already been followed up, `InterviewEngine.followUpResponse()` generates a follow-up question for the same plan item using `QuestionGenerator.followUp()` or AI. `DifficultyAdapter.nextDifficulty()` adjusts subsequent question difficulty based on `evaluation.verdict`. | `server/src/interview/interviewEngine.ts:131-133,171-189`, `server/src/interview/difficultyAdapter.ts` | **PASS** | None | None |
| 6 | **Maintain conversation context throughout the interview** | `ConversationMemory` on each `InterviewSession` stores: current topic, all asked question texts + normalised keys, full `InterviewTurn[]` history (question + answer + evaluation), mistakes, and follow-up tracking. `SessionManager` persists sessions in memory with TTL. Every subsequent request retrieves the session by `sessionId`. | `server/src/memory/conversationMemory.ts`, `server/src/sessions/sessionManager.ts` | **PASS** | None | None |
| 7 | **Produce structured final feedback** | `InterviewEngine.doneResponse()` calls `FeedbackGenerator.generate()` (or `FeedbackService` if AI is enabled). Returns `Feedback` object with `summary`, `strengths[]`, `gaps[]`, `next[]`, `topicScores`, `recommendedDays`, `learningPath`, `overallRating`. | `server/src/interview/interviewEngine.ts:192-205`, `server/src/feedback/feedbackGenerator.ts` | **PARTIAL** | `next[]` is 3 generic hardcoded strings not linked to specific curriculum days. `learningPath` items don't reference actual curriculum day titles from the data. | Fix `feedbackGenerator.ts` to derive `next[]` from actual `recommendedDays` and curriculum titles. |
| 8 | **Expose POST /api/interview** | Express router mounts `interviewRouter` at `/api`. `POST /api/interview` is registered with `validateBody(interviewRequestSchema)` and `postInterview` controller. | `server/src/routes/interview.routes.ts:8`, `server/src/app.ts:31` | **PASS** | None | None |
| 9 | **Use sessionId to maintain interview state** | First request: if `body.candidate` or `body.candidateId` is provided and no `body.message`, calls `engine.start(sessionId, candidate)`. Subsequent requests: if `body.message` is present, calls `engine.answer(sessionId, body.message)`. Session is never required to re-send the candidate object. `SessionManager.get()` returns `undefined` for unknown `sessionId` → `AppError(404)`. | `server/src/controllers/interviewController.ts:52-86`, `server/src/sessions/sessionManager.ts:13-22` | **PASS** | None | None |
| 10 | **Final feedback must contain: summary: string, strengths: string[], gaps: string[], next: string[]** | `Feedback` type in `domain.ts` includes all four fields. `FeedbackGenerator` and `FeedbackService` both populate all four. The API response when `done === true` includes `feedback` object. Frontend `FeedbackDashboard` consumes all four fields. | `server/src/types/domain.ts:225-234`, `server/src/feedback/feedbackGenerator.ts:20-33` | **PARTIAL** | `next[]` values are hardcoded generic strings, not curriculum-day-specific recommendations. See Req 7 above. | Fix `feedbackGenerator.ts` and `feedbackService.ts` to generate curriculum-linked `next[]` items. |

---

## Additional Requirements (from Candidate/Curriculum specification)

| # | Requirement | Implementation | Status |
|---|---|---|---|
| C1 | Candidate data includes completed missions | `CandidateProfileBuilder` reads `mission.passed === true` → `completedDays[]` | PASS |
| C2 | Candidate data includes skipped topics | `mission.skipped === true` → `skippedDays[]`, treated as `weakArea` with reason `"skipped"` | PASS |
| C3 | Candidate data includes attempts | `mission.attempts` drives `firstTryRate`, `average attempts`, and determines `weakArea.reason === "struggled"` when `attempts >= 4` | PASS |
| C4 | Candidate data includes learning signals | `candidate.signals.commitDays`, `missionsCompleted`, `missionsFirstTry` all used in `CandidateScoring` | PASS |
| C5 | Candidate data includes experience | `candidate.member.yearsExperience` → `seniority` (emerging/mid/senior) → affects starting difficulty | PASS |
| C6 | Candidate data includes role | `candidate.member.jobRole` stored in `CandidateAnalysis.role`, used in intro message | PASS |
| C7 | Candidate data includes education | Stored in candidate object, passed through session, displayed on frontend | PASS |
| C8 | Curriculum contains modules | 8 modules with day ranges in `curriculum.json`, loaded by `CurriculumRepository`, used by planner | PASS |
| C9 | Curriculum contains daily topics | All 31 days loaded with title, type, tools, objectives | PASS |
| C10 | Curriculum contains learning objectives | `day.objectives[]` used as `PlanItem.objective` and passed to question generator | PASS |
| C11 | Curriculum contains tools | `day.tools[]` stored per curriculum day, available to question generator | PASS |

---

## Summary

| Status | Count |
|---|---|
| ✅ PASS | 15 |
| ⚠️ PARTIAL | 2 |
| ❌ FAIL | 0 |

### Critical Missing Requirements
- **Req 7 / Req 10**: `next[]` array in final feedback contains 3 generic hardcoded strings instead of curriculum-day-specific recommendations traceable to actual interview performance.

### Secondary Missing Requirements
- Backend does not return `interviewPlan` data in the start response, so the frontend `AiAnalysis` screen cannot display the actual selected curriculum days — it currently shows static/computed values instead.

### Recommended Implementation Order
1. Fix `feedbackGenerator.ts` `next[]` to be curriculum-day-specific → resolves PARTIAL on Req 7 & 10
2. Add `interviewPlan` to `InterviewResponse` from start endpoint → enables frontend to show real plan
3. Update `AiAnalysis.tsx` to display actual plan data → closes the "personalization reveal" gap
4. Strengthen AI prompts (planner.md, question.md, evaluation.md) → improves AI mode quality
5. Create acceptance tests → validates all requirements end-to-end
