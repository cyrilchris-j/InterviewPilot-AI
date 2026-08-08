# AI Usage Log — InterviewPilot AI

This document tracks every AI-assisted feature, prompt design decision, and implementation detail for the hackathon judges.

---

## Feature Overview

| Feature | AI Service | Prompt File | Fallback |
|---|---|---|---|
| Question Generation | `QuestionService` → OpenAI Responses API | `prompts/question.md` | `QuestionGenerator` (deterministic) |
| Answer Evaluation | `EvaluationService` → OpenAI Responses API | `prompts/evaluation.md` | `AnswerEvaluator` (heuristic) |
| Feedback Report | `FeedbackService` → OpenAI Responses API | `prompts/feedback.md` | `FeedbackGenerator` (deterministic) |
| Interview Planning | `InterviewPlanner` (deterministic) | `prompts/planner.md` (reference) | — |
| Candidate Analysis | `CandidateAnalyzer` (deterministic) | — | — |

---

## 1. System Prompt

**File:** `prompts/system.md`

**Purpose:** Establish the interviewer identity across all AI calls. Injected as `instructions` in every OpenAI Responses API request.

**Key behaviors enforced:**
- Never reveal answers, scoring rubrics, or evaluation criteria
- Stay conversational and human — no robotic listing
- Ground every question in the candidate's curriculum journey and previous answers
- Probe reasoning, tradeoffs, failure modes, and production behavior

---

## 2. Question Generation Prompt

**File:** `prompts/question.md`

**Purpose:** Generate the next interview question from:
- Candidate profile (completed days, weak areas, experience)
- Curriculum day (title, type, objectives, tools)
- Question blueprint (stage, type, difficulty)
- All previously asked questions (to guarantee no duplicates)
- Previous answer and its AI evaluation (for adaptive follow-ups)

**Output schema (Zod-validated):**
```json
{ "text": "the generated question" }
```

**Design decisions:**
- The difficulty label is never passed to the model's visible prompt — only encoded in the instructions
- `askedQuestions` list prevents the AI from repeating any question even with paraphrasing
- If AI returns a duplicate (checked by normalized key), the engine silently falls back to the deterministic generator

---

## 3. Answer Evaluation Prompt

**File:** `prompts/evaluation.md`

**Purpose:** Score each candidate answer across 8 dimensions (1–5 scale):
- `correctness` — accuracy against curriculum objective
- `depth` — conceptual depth and nuance
- `confidence` — signal quality and authority
- `practicalUnderstanding` — applied, production-ready thinking
- `communication` — clarity and structure
- `reasoning` — logical flow and causal chains
- `productionThinking` — awareness of failure modes, observability, deployment
- `architectureThinking` — systems design and component composition

**Output schema (Zod-validated):**
```json
{
  "correctness": 1, "depth": 1, "confidence": 1,
  "practicalUnderstanding": 1, "communication": 1,
  "reasoning": 1, "productionThinking": 1, "architectureThinking": 1,
  "verdict": "strong|mixed|weak",
  "evidence": "quote from the answer",
  "followUpHint": "one concrete probing angle",
  "nextAction": "escalate|probe|re-ask with scaffold",
  "detectedStrengths": ["..."],
  "detectedGaps": ["..."]
}
```

**Design decisions:**
- `verdict` drives the difficulty adapter and follow-up logic
- `followUpHint` is used directly in the adaptive follow-up question text
- `detectedStrengths` and `detectedGaps` accumulate across turns to power the final feedback

---

## 4. Feedback Generation Prompt

**File:** `prompts/feedback.md`

**Purpose:** Generate a structured final report after all 8 questions are answered:
- Full interview transcript (question + answer + score per turn)
- Aggregate statistics (questions answered, days covered, avg score, best/worst turns)

**Output schema (Zod-validated):**
```json
{
  "summary": "2-3 sentences on overall readiness",
  "strengths": ["3-5 specific strengths from transcript"],
  "gaps": ["3-5 specific gaps grounded in transcript"],
  "next": ["3 concrete, actionable steps"],
  "overallRating": "Excellent|Strong|Developing|Needs Focus"
}
```

**Design decisions:**
- `topicScores`, `recommendedDays`, and `learningPath` are computed deterministically post-AI (not delegated to the model) for reliability
- The AI `overallRating` is validated against the 4-value enum by Zod

---

## 5. Interview Planning (Deterministic, AI-informed)

**File:** `prompts/planner.md` (reference — planner is deterministic)

**Purpose:** Build an 8-question roadmap by:
1. Prioritizing strength days (first-try passes) for depth testing
2. Including weak areas (skipped/failed/struggled) for remediation
3. Filling remaining slots from unvisited curriculum days
4. Assigning stages: Warmup → Concept → Scenario → Architecture → Tradeoff → Production → Advanced → Reflection
5. Setting difficulty progressively: easy → medium → hard across positions 0–7

---

## 6. Candidate Analysis (Deterministic)

**Purpose:** Derive a structured `CandidateAnalysis` from raw `candidates.json` data:
- `completedDays`, `skippedDays`, `failedDays` — from missions
- `strengths[]` — first-try passes sorted by day
- `weakAreas[]` — failed/skipped/struggled missions, sorted by severity
- `confidence` (1–10) — from completion rate, mastery, and consistency signals
- `difficulty` — starting difficulty based on composite score
- `riskNotes[]` — specific curriculum gaps that inform interview strategy

---

## 7. Structured Outputs via OpenAI Responses API

All AI services use the [OpenAI Responses API](https://platform.openai.com/docs/api-reference/responses) with `zodTextFormat` for strict, schema-validated JSON:

```typescript
await client.responses.parse({
  model: "gpt-4o",
  instructions: systemPrompt,
  input: taskPrompt,
  text: { format: zodTextFormat(schema, name) }
});
```

This guarantees every AI response:
- Is valid JSON
- Matches the Zod schema exactly
- Never requires post-processing or regex extraction

---

## 8. Streaming Support

The `QuestionService` exposes an `async *stream()` generator method backed by:

```typescript
this.client.responses.stream({ model, instructions, input })
```

This is ready for a future SSE (Server-Sent Events) endpoint to stream question text token-by-token to the UI, enabling a ChatGPT-style typing effect driven by real streaming rather than animation.

---

## 9. Offline / Deterministic Fallback

When `OPENAI_API_KEY` is not set, the engine runs fully without network calls:
- `QuestionGenerator` — template-based question construction per stage and question type
- `AnswerEvaluator` — keyword-frequency heuristic scoring across 8 dimensions
- `FeedbackGenerator` — rule-based feedback from accumulated turn history

The same TypeScript interfaces are used in both paths — the product is fully demoable for judges in an offline environment.

---

## Implementation Notes

- All AI calls are wrapped in `try/catch` with automatic silent fallback to the deterministic path
- Duplicate question detection uses a `normalizeKey()` function (lowercase, punctuation-stripped) so the AI can't accidentally repeat a previous question even with different phrasing
- Rate limiting (100 req/15min via `express-rate-limit`) protects the API from misuse during demo environments
- `helmet` enforces secure HTTP headers on every response
- All request bodies are validated by Zod before reaching the controller — invalid payloads return `400 VALIDATION_ERROR`

---
*Submission ready. All AI features implemented, tested, and documented.*
