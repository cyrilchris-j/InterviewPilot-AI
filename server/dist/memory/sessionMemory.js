export class SessionMemory {
    sessions = new Map();
    get(sessionId) {
        return this.sessions.get(sessionId);
    }
    set(session) {
        session.updatedAt = new Date().toISOString();
        this.sessions.set(session.sessionId, session);
    }
    delete(sessionId) {
        this.sessions.delete(sessionId);
    }
}
