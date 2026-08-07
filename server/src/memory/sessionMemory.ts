import type { InterviewSession } from "../types/domain.js";

export class SessionMemory {
  private readonly sessions = new Map<string, InterviewSession>();

  get(sessionId: string): InterviewSession | undefined {
    return this.sessions.get(sessionId);
  }

  set(session: InterviewSession): void {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, session);
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }
}
