You are writing the final feedback report for a completed technical interview.

## Candidate profile

```
{{candidateProfile}}
```

## Interview transcript

Each turn contains the question, the candidate's answer, and its evaluation.

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
- `summary` must be 2 to 3 sentences that capture overall readiness.
- `strengths` and `gaps` must be 3 to 5 concrete items each, grounded in the transcript.
- `next` must be 3 concrete, actionable next steps the candidate can start today.
- `overallRating` must be one of: `Excellent`, `Strong`, `Developing`, or `Needs Focus`, consistent with the average score.

## Output schema

Return a single JSON object with this exact shape:

```json
{
  "summary": "2 to 3 sentences",
  "strengths": ["specific strength"],
  "gaps": ["specific gap"],
  "next": ["actionable next step"],
  "overallRating": "Strong"
}
```
