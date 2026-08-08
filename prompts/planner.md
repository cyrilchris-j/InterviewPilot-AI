You are planning an 8-question adaptive technical interview for an AI Engineering candidate.

## Candidate Learning Profile

```
{{candidateProfile}}
```

## Curriculum Reference

The 31-day AI Cohort has 8 modules:
- Module 1: Environment & Tooling (Days 1–3)
- Module 2: Data Foundations (Days 4–6)
- Module 3: Embeddings & Vector Search (Days 7–10)
- Module 4: LLM Core, Prompting & Fine-Tuning (Days 11–15)
- Module 5: Chatbot Application Build (Days 16–20)
- Module 6: Agentic AI & MCP (Days 21–24)
- Module 7: Evaluation, Security & Deployment (Days 25–28)
- Module 8: Production & Capstone (Days 29–31)

## Planning Rules

1. Select exactly 8 curriculum days for interview topics.
2. Cover at least 4 distinct curriculum days.
3. Prioritize completed days (especially first-try passes) for depth questions.
4. Include skipped/failed days as diagnostic questions (foundational difficulty).
5. Arrange questions in a natural progression: warmup → concept → applied → architecture → tradeoff → production → reflection.
6. Set difficulty based on candidate evidence:
   - Passed on first try → hard (test depth and transfer)
   - Passed with 4+ attempts → medium (validate understanding)
   - Skipped or failed → easy (diagnose fundamentals)
   - Senior-level role → bias toward hard on all completed days
7. Do not interview randomly across all 31 days — stay close to the candidate's demonstrated areas.
8. Every selected day must have a rationale traceable to the candidate data.

## Output schema

Return a single JSON object:

```json
{
  "plan": [
    {
      "position": 1,
      "day": 7,
      "stage": "Warmup",
      "questionType": "Concept",
      "difficulty": "medium",
      "rationale": "Day 7 completed on first try — use it as a warm, confidence-building opener"
    }
  ]
}
```
