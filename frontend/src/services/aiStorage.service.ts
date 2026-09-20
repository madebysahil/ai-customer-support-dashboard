export interface AiMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    model?: string;
    latency?: number;
    confidenceScore?: number;
    citations?: any[];
    tokenUsage?: number;
  };
}

export interface AiSession {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messages: AiMessage[];
  isPinned: boolean;
  context?: {
    customerId?: string;
    ticketId?: string;
  };
}

export interface IAiStorageService {
  getSessions(): Promise<AiSession[]>;
  getSession(id: string): Promise<AiSession | null>;
  saveSession(session: AiSession): Promise<void>;
  deleteSession(id: string): Promise<void>;
}

// Temporary LocalStorage Implementation
class LocalStorageAiService implements IAiStorageService {
  private STORAGE_KEY = 'ai_copilot_sessions';

  private read(): AiSession[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private write(data: AiSession[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    }
  }

  async getSessions(): Promise<AiSession[]> {
    return this.read().sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  async getSession(id: string): Promise<AiSession | null> {
    const sessions = this.read();
    return sessions.find(s => s.id === id) || null;
  }

  async saveSession(session: AiSession): Promise<void> {
    const sessions = this.read();
    const index = sessions.findIndex(s => s.id === session.id);
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    this.write(sessions);
  }

  async deleteSession(id: string): Promise<void> {
    const sessions = this.read();
    this.write(sessions.filter(s => s.id !== id));
  }
}

// Export the singleton instance behind the interface.
// Replacing this later with an API-based implementation requires zero UI changes.
export const aiStorageService: IAiStorageService = new LocalStorageAiService();
