You are writing the final feedback report for a completed technical interview tied to a 31-day AI Engineering Cohort curriculum.

## Candidate profile

```
{{candidateProfile}}
```

## Interview transcript

Each turn contains the curriculum day, question, the candidate's answer, and its evaluation.

```
{{transcript}}
```

Aggregate statistics:
- Questions answered: {{questionsAnswered}}
- Unique curriculum days covered: {{daysCovered}}
- Average score: {{averageScore}} out of 5
- Strongest turns: {{strongestTurns}}
- Weakest turns: {{weakestTurns}}

## Rules

- Write like a senior mentor: specific, actionable, and respectful.
- `summary` must be 2 to 3 sentences that capture overall AI engineering readiness. Reference specific curriculum areas demonstrated.
- `strengths` must be 3 to 5 concrete items grounded in actual transcript evidence. Each strength should reference the specific curriculum area (e.g. "Day 10 Retrieval", "Day 22 Multi-Agent").
- `gaps` must be 3 to 5 concrete items grounded in actual weak/missed answers. Reference the specific curriculum day and topic (e.g. "Day 29 Monitoring & Observability").
- `next` must be 3 concrete, curriculum-linked next steps. Format: "Day X — [Topic]: [specific action]". Only reference days that actually exist in the 31-day curriculum and relate to the candidate's actual gaps.
  - Example: "Day 29 — Monitoring & Observability: Practice adding structured logging and Prometheus metrics to a FastAPI backend."
  - Example: "Day 12 — Prompt Engineering: Build 3 different system prompts for the same use case and compare outputs."
  - Example: "Day 22 — Multi-Agent Orchestration: Implement a router agent using LangGraph that delegates to specialist agents."
- `overallRating` must be one of: `Excellent`, `Strong`, `Developing`, or `Needs Focus`, consistent with the average score.

## Output schema

Return a single JSON object with this exact shape:

```json
{
  "summary": "2 to 3 sentences about the candidate's AI engineering readiness",
  "strengths": ["specific strength referencing curriculum area"],
  "gaps": ["specific gap referencing curriculum day and topic"],
  "next": ["Day X — Topic: specific action the candidate can take today"],
  "overallRating": "Strong"
}
```
