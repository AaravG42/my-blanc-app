// Shared session store for API routes
// In production, this would be a database

interface SessionData {
  participants: string[];
  creator: string;
  timestamp: number;
}

// Use global to persist across hot reloads in development
const globalForSessions = globalThis as unknown as {
  sessions: Map<string, SessionData> | undefined;
};

if (!globalForSessions.sessions) {
  globalForSessions.sessions = new Map();
}

const sessions = globalForSessions.sessions;

export const sessionStore = {
  createSession(sessionId: string, creator: string): void {
    console.log("Creating session:", sessionId, "for creator:", creator);
    sessions.set(sessionId, {
      participants: [],
      creator,
      timestamp: Date.now(),
    });
    console.log("Session created, total sessions:", sessions.size);
    console.log("All sessions:", Array.from(sessions.keys()));
  },

  getSession(sessionId: string): SessionData | null {
    const session = sessions.get(sessionId);
    console.log("Getting session:", sessionId, "found:", session);
    console.log("All sessions:", Array.from(sessions.keys()));
    return session || null;
  },

  addParticipant(sessionId: string, participant: string): boolean {
    console.log("Adding participant:", participant, "to session:", sessionId);
    console.log("All sessions before add:", Array.from(sessions.keys()));
    const session = sessions.get(sessionId);

    if (!session) {
      console.log("Session not found:", sessionId);
      return false;
    }

    if (!session.participants.includes(participant)) {
      session.participants.push(participant);
      console.log("Participant added, new list:", session.participants);
      return true;
    } else {
      console.log("Participant already exists");
      return false;
    }
  },
};
