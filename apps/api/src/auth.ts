import type { FastifyRequest } from 'fastify';
import type { UserInfo } from 'remult';

// Simple session-based authentication for MVP
// In production, use proper JWT or session management
const sessions = new Map<string, UserInfo>();

export function createAuthMiddleware() {
  return async (req: FastifyRequest): Promise<UserInfo | undefined> => {
    const sessionId = req.headers['x-session-id'] as string;

    if (!sessionId) {
      return undefined;
    }

    return sessions.get(sessionId);
  };
}

export function createSession(user: UserInfo): string {
  const sessionId = Math.random().toString(36).substring(2);
  sessions.set(sessionId, user);
  return sessionId;
}

export function destroySession(sessionId: string): void {
  sessions.delete(sessionId);
}
