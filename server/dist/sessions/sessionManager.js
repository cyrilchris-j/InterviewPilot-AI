export class SessionManager {
    ttlMs;
    sessions = new Map();
    constructor(ttlMs) {
        this.ttlMs = ttlMs;
    }
    get(sessionId) {
        this.sweepExpired();
        const stored = this.sessions.get(sessionId);
        if (!stored)
            return undefined;
        if (stored.expiresAt <= Date.now()) {
            this.sessions.delete(sessionId);
            return undefined;
        }
        return stored.session;
    }
    set(session) {
        session.updatedAt = new Date().toISOString();
        this.sessions.set(session.sessionId, {
            session,
            expiresAt: Date.now() + this.ttlMs
        });
    }
    delete(sessionId) {
        this.sessions.delete(sessionId);
    }
    count() {
        this.sweepExpired();
        return this.sessions.size;
    }
    sweepExpired() {
        const now = Date.now();
        for (const [sessionId, stored] of this.sessions.entries()) {
            if (stored.expiresAt <= now) {
                this.sessions.delete(sessionId);
            }
        }
    }
}
