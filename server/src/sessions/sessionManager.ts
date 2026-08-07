import type { InterviewSession } from "../types/domain.js";

type StoredSession = {
  session: InterviewSession;
  expiresAt: number;
};

export class SessionManager {
  private readonly sessions = new Map<string, StoredSession>();

  constructor(private readonly ttlMs: number) {}

  get(sessionId: string): InterviewSession | undefined {
    this.sweepExpired();
    const stored = this.sessions.get(sessionId);
    if (!stored) return undefined;
    if (stored.expiresAt <= Date.now()) {
      this.sessions.delete(sessionId);
      return undefined;
    }
    return stored.session;
  }

  set(session: InterviewSession): void {
    session.updatedAt = new Date().toISOString();
    this.sessions.set(session.sessionId, {
      session,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  delete(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  count(): number {
    this.sweepExpired();
    return this.sessions.size;
  }

  private sweepExpired(): void {
    const now = Date.now();
    for (const [sessionId, stored] of this.sessions.entries()) {
      if (stored.expiresAt <= now) {
        this.sessions.delete(sessionId);
      }
    }
  }
}
