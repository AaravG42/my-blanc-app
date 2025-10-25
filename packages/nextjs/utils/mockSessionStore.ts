// Simple session store using Vercel API routes
// This works for deployment and handles cross-user communication

interface SessionData {
  participants: string[];
  creator: string;
  timestamp: number;
}

class SimpleSessionStore {
  private static instance: SimpleSessionStore;
  private subscribers: Map<string, Set<(data: SessionData) => void>> = new Map();

  private constructor() {
    // Start polling for updates
    this.startPolling();
  }

  static getInstance(): SimpleSessionStore {
    if (!SimpleSessionStore.instance) {
      SimpleSessionStore.instance = new SimpleSessionStore();
    }
    return SimpleSessionStore.instance;
  }

  async createSession(sessionId: string, creator: string): Promise<void> {
    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, creator }),
      });

      if (response.ok) {
        console.log("Session created:", sessionId);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  }

  async addParticipant(sessionId: string, participant: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/participants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ participant }),
      });

      if (response.ok) {
        const data = await response.json();
        this.notifySubscribers(sessionId, data);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Failed to add participant:", error);
      return false;
    }
  }

  async getSession(sessionId: string): Promise<SessionData | null> {
    try {
      const response = await fetch(`/api/sessions?sessionId=${sessionId}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Failed to get session:", error);
      return null;
    }
  }

  subscribe(sessionId: string, callback: (data: SessionData) => void): () => void {
    if (!this.subscribers.has(sessionId)) {
      this.subscribers.set(sessionId, new Set());
    }
    this.subscribers.get(sessionId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(sessionId);
      if (subs) {
        subs.delete(callback);
      }
    };
  }

  private notifySubscribers(sessionId: string, data: SessionData): void {
    const subs = this.subscribers.get(sessionId);
    if (subs) {
      subs.forEach(callback => callback(data));
    }
  }

  private startPolling(): void {
    // Poll for updates every 2 seconds
    setInterval(() => {
      this.subscribers.forEach((_, sessionId) => {
        this.getSession(sessionId).then(data => {
          if (data) {
            this.notifySubscribers(sessionId, data);
          }
        });
      });
    }, 2000);
  }
}

export const mockSessionStore = SimpleSessionStore.getInstance();

// In a real implementation, these would be API calls or smart contract interactions:
// - POST /api/sessions - Create a new session
// - POST /api/sessions/:id/participants - Add participant
// - GET /api/sessions/:id - Get session data
// - WebSocket connection for real-time updates
