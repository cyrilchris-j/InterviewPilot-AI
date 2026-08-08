# ACCEPTANCE-TEST.md — InterviewPilot AI Acceptance Test Suite

**Test Execution Date**: 2026-08-08T18:17:39.267Z  
**Status**: ALL PASSED ✅  

---

## Test Overview

The acceptance test suite executes complete end-to-end interview sessions against 5 distinct synthetic candidate profiles using the core `InterviewEngine` pipeline.

### Verification Criteria
1. **Minimum Questions**: Each interview must include at least 8 questions.
2. **Curriculum Coverage**: Each interview must span at least 4 distinct curriculum days.
3. **Structured Feedback**: Final response (`done: true`) must contain a valid `Feedback` object with `summary`, `strengths`, `gaps`, and `next` fields.
4. **Curriculum-Linked Actions**: The `next[]` items must be explicitly linked to curriculum days and topics.

---

## Results Summary Table

| Candidate ID | Name | Questions Answered | Unique Days Covered | Feedback Valid? | Curriculum-Linked Next Step Sample |
|---|---|---|---|---|---|
| `CAND-001` | Sarah Johnson | 16 | 8 (Days: 7, 8, 16, 31, 10, 12, 22, 23) | ✅ PASS | `Day 7 — Embeddings Explained: Practice how to generate embeddings with Sentence Transformers and visualize clusters.` |
| `CAND-002` | Alex Turner | 16 | 8 (Days: 16, 18, 28, 7, 8, 10, 12, 13) | ✅ PASS | `Day 16 — Chatbot Backend & API Integration: Review the learning objectives and complete a hands-on exercise focused on "Create a /chat API endpoint for the healthcare chatbot".` |
| `CAND-003` | Emily Chen | 16 | 8 (Days: 7, 8, 10, 11, 12, 13, 21, 22) | ✅ PASS | `Day 7 — Embeddings Explained: Practice how to generate embeddings with Sentence Transformers and visualize clusters.` |
| `CAND-004` | David Miller | 16 | 8 (Days: 7, 8, 10, 12, 16, 20, 22, 23) | ✅ PASS | `Day 7 — Embeddings Explained: Practice how to generate embeddings with Sentence Transformers and visualize clusters.` |
| `CAND-005` | Michael Brown | 16 | 8 (Days: 18, 28, 29, 31, 7, 8, 10, 12) | ✅ PASS | `Day 18 — Full-Stack Integration & Streaming Responses: Review the learning objectives and complete a hands-on exercise focused on "Implement real-time streaming responses from the LLM".` |

---

## Detailed Test Logs

### Candidate: Sarah Johnson (`CAND-001`)
- **Total Questions**: 16 (Requirement: ≥ 8) — **PASSED**
- **Unique Curriculum Days**: 8 (Requirement: ≥ 4) — **PASSED**
- **Summary**: Sarah Johnson completed a 16-question adaptive interview covering 8 curriculum days, including Embeddings Explained, Vector Databases Overview, Chatbot Backend & API Integration. With an average score of 2.1/5, the candidate needs to revisit core curriculum areas before advancing to senior-level scenarios. The areas below provide a clear curriculum-linked roadmap for continued growth.
- **Strengths**: 3 items
- **Gaps**: 3 items
- **Curriculum Next Steps**: 3 items

### Candidate: Alex Turner (`CAND-002`)
- **Total Questions**: 16 (Requirement: ≥ 8) — **PASSED**
- **Unique Curriculum Days**: 8 (Requirement: ≥ 4) — **PASSED**
- **Summary**: Alex Turner completed a 16-question adaptive interview covering 8 curriculum days, including Chatbot Backend & API Integration, Full-Stack Integration & Streaming Responses, Docker & Kubernetes Deployment. With an average score of 2/5, the candidate needs to revisit core curriculum areas before advancing to senior-level scenarios. The areas below provide a clear curriculum-linked roadmap for continued growth.
- **Strengths**: 3 items
- **Gaps**: 3 items
- **Curriculum Next Steps**: 3 items

### Candidate: Emily Chen (`CAND-003`)
- **Total Questions**: 16 (Requirement: ≥ 8) — **PASSED**
- **Unique Curriculum Days**: 8 (Requirement: ≥ 4) — **PASSED**
- **Summary**: Emily Chen completed a 16-question adaptive interview covering 8 curriculum days, including Embeddings Explained, Vector Databases Overview, The Retrieval & Matching Engine. With an average score of 2.1/5, the candidate needs to revisit core curriculum areas before advancing to senior-level scenarios. The areas below provide a clear curriculum-linked roadmap for continued growth.
- **Strengths**: 3 items
- **Gaps**: 3 items
- **Curriculum Next Steps**: 3 items

### Candidate: David Miller (`CAND-004`)
- **Total Questions**: 16 (Requirement: ≥ 8) — **PASSED**
- **Unique Curriculum Days**: 8 (Requirement: ≥ 4) — **PASSED**
- **Summary**: David Miller completed a 16-question adaptive interview covering 8 curriculum days, including Embeddings Explained, Vector Databases Overview, The Retrieval & Matching Engine. With an average score of 1.9/5, the candidate needs to revisit core curriculum areas before advancing to senior-level scenarios. The areas below provide a clear curriculum-linked roadmap for continued growth.
- **Strengths**: 3 items
- **Gaps**: 3 items
- **Curriculum Next Steps**: 3 items

### Candidate: Michael Brown (`CAND-005`)
- **Total Questions**: 16 (Requirement: ≥ 8) — **PASSED**
- **Unique Curriculum Days**: 8 (Requirement: ≥ 4) — **PASSED**
- **Summary**: Michael Brown completed a 16-question adaptive interview covering 8 curriculum days, including Full-Stack Integration & Streaming Responses, Docker & Kubernetes Deployment, Monitoring, Logging & Observability. With an average score of 2.1/5, the candidate needs to revisit core curriculum areas before advancing to senior-level scenarios. The areas below provide a clear curriculum-linked roadmap for continued growth.
- **Strengths**: 3 items
- **Gaps**: 3 items
- **Curriculum Next Steps**: 3 items

