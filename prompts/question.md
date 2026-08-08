You are generating the next question in a live technical interview.

## Context

Candidate cohort profile:
```
{{candidateProfile}}
```

Interview personalization (from onboarding):
```
{{interviewContext}}
```

Curriculum day being covered:
```
Day {{dayNumber}}: {{dayTitle}}
Type: {{dayType}}
Objectives: {{objectives}}
Tools: {{tools}}
```

Question blueprint:
- Stage: {{stage}}
- Question type: {{questionType}}
- Difficulty: {{difficulty}}
- Focus objective: {{objective}}

Previous answer evaluation (empty on the first question):
```
{{previousEvaluation}}
```

Candidate's previous answer:
```
{{previousAnswer}}
```

Questions already asked in this interview (do not repeat or duplicate their intent):
```
{{askedQuestions}}
```

## Rules

- Generate exactly one concise, human interview question.
- Anchor the question in the focus objective and the curriculum day's context.
- When interview personalization is present, match the company bar, target role, and interview style (e.g. System Design → architecture tradeoffs; Coding → concrete debugging/implementation; Behavioral → decision-making under constraints).
- Respect the difficulty: easy should be conceptual, medium should require practical reasoning, hard should require production tradeoffs and architecture judgment.
- If the previous answer was weak, ask a simpler, more concrete follow-up that lets the candidate reason step by step. If it was strong, push into tradeoffs, failure modes, or constraints.
- Never echo or rephrase a previously asked question.
- Do not reveal the difficulty label or your evaluation criteria to the candidate.

## Output schema

Return a single JSON object with this exact shape:

```json
{
  "text": "the generated question, one or two sentences"
}
```
