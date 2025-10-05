import { CacheEntry, SessionData } from '@/types/results';

class CacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private sessions: Map<string, SessionData> = new Map();

  set<T>(key: string, data: T, ttlMinutes: number = 60): void {
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    this.cache.set(key, { data, expiresAt });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (new Date() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  setSession(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
  }

  getSession(sessionId: string): SessionData | null {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      return null;
    }

    if (new Date() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return null;
    }

    return session;
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  clearExpired(): void {
    const now = new Date();
    
    // Clear expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }

    // Clear expired sessions
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(sessionId);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.sessions.clear();
  }
}

export const cacheManager = new CacheManager();

// Clear expired entries every 10 minutes
setInterval(() => {
  cacheManager.clearExpired();
}, 10 * 60 * 1000);
