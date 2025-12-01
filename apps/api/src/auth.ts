import type { FastifyRequest } from 'fastify';
import type { UserInfo } from 'remult';
import jwt from 'jsonwebtoken';
import type { Env } from './env.js';

// JWT-based authentication
export function createAuthMiddleware(env: Env) {
  return async (req: FastifyRequest): Promise<UserInfo | undefined> => {
    // Support both Bearer token and x-session-id (for backwards compatibility during migration)
    const authHeader = req.headers['authorization'] as string;
    const sessionId = req.headers['x-session-id'] as string;

    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (sessionId) {
      // Legacy session support - treat session ID as JWT for now
      token = sessionId;
    }

    if (!token) {
      return undefined;
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;

      return {
        id: decoded.userId,
        name: decoded.name,
        roles: decoded.roles,
        schoolId: decoded.schoolId,
      };
    } catch (error) {
      // Invalid or expired token
      return undefined;
    }
  };
}

interface JWTPayload {
  userId: string;
  name: string;
  email: string;
  roles: string[];
  schoolId?: string;
  iat: number;
  exp: number;
}

export function createToken(user: { id: string; name: string; email: string; role: string; schoolId?: string }, env: Env): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    name: user.name,
    email: user.email,
    roles: [user.role],
    schoolId: user.schoolId,
  };

  // Token expires in 7 days
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string, env: Env): JWTPayload | null {
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}
