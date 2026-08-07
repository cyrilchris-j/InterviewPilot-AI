# Shared API Contract

`POST /api/interview` is the only API endpoint required by the interview engine.

Request fields:

- `sessionId`: stable session identifier
- `candidate`: optional full candidate object for interview start
- `candidateId`: optional candidate id loaded from `server/data/candidates.json`
- `message`: candidate answer for a conversation turn
- `action`: optional control action, currently `catalog` or `reset`

Response fields:

- `reply`: interviewer response
- `done`: true only when final feedback is ready
- `sessionId`: current session id
- `question`: current question metadata when available
- `progress`: question counter and completion percentage
- `metrics`: latest score and confidence indicators
- `feedback`: final feedback object when `done` is true
