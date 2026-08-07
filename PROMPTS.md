# AI Usage Log

## System Prompt

**Purpose:** Establish the interviewer identity and behavioral rules.

**Prompt:** `prompts/system.md`

**Output:** A senior-engineer interviewer voice that is conversational, adaptive, and never reveals answers.

## Planner Prompt

**Purpose:** Convert curriculum days and candidate learning signals into an eight-question roadmap.

**Prompt:** `prompts/planner.md`

**Output:** Interview stages covering warmup, intermediate, advanced, scenario, architecture, tradeoff, reflection, and follow-up.

## Question Prompt

**Purpose:** Generate the next interview question from the roadmap, current difficulty, previous answer, and memory.

**Prompt:** `prompts/question.md`

**Output:** A human, non-duplicate question grounded in curriculum objectives.

## Evaluation Prompt

**Purpose:** Score each answer for correctness, depth, confidence, practical understanding, communication, reasoning, production thinking, and architecture thinking.

**Prompt:** `prompts/evaluation.md`

**Output:** Structured JSON consumed by the difficulty adapter and feedback generator.

## Feedback Prompt

**Purpose:** Produce final structured feedback after the eighth answer.

**Prompt:** `prompts/feedback.md`

**Output:** `summary`, `strengths[]`, `gaps[]`, `next[]`, topic scores, recommended days, and transcript-level insights.

## Implementation Notes

The backend calls the OpenAI Responses API with `text.format.type = "json_schema"` for structured outputs when an API key is present. Offline mode uses the same TypeScript interfaces and deterministic scoring so the product remains demoable in a judging environment.
