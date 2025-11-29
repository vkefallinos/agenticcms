import type { FastifyInstance } from 'fastify';
import { repo } from 'remult';
import { User, CreditTransaction } from '@agenticcms/core';
import { createSession, destroySession } from './auth';

export function registerRoutes(app: FastifyInstance) {
  // Login endpoint (simplified for MVP)
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const userRepo = repo(User);
    const user = await userRepo.findFirst({ email });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // In production, use proper password hashing (bcrypt, argon2)
    if (user.password !== password) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const sessionId = createSession({
      id: user.id,
      name: user.name,
      roles: [user.role],
    });

    return {
      sessionId,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    };
  });

  // Logout endpoint
  app.post('/api/auth/logout', async (request, reply) => {
    const sessionId = request.headers['x-session-id'] as string;
    if (sessionId) {
      destroySession(sessionId);
    }
    return { success: true };
  });

  // Register endpoint (simplified for MVP)
  app.post('/api/auth/register', async (request, reply) => {
    const { email, password, name, role } = request.body as {
      email: string;
      password: string;
      name: string;
      role: string;
    };

    const userRepo = repo(User);

    // Check if user exists
    const existing = await userRepo.findFirst({ email });
    if (existing) {
      return reply.code(400).send({ error: 'User already exists' });
    }

    // Create user with initial credits
    const user = await userRepo.insert({
      email,
      password, // In production, hash the password
      name,
      role: role as any,
      credits: 100, // Give new users 100 credits
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    };
  });

  // Mock payment endpoint - adds credits to user
  app.post('/api/credits/purchase', async (request, reply) => {
    const sessionId = request.headers['x-session-id'] as string;
    if (!sessionId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { amount } = request.body as { amount: number };

    if (!amount || amount <= 0) {
      return reply.code(400).send({ error: 'Invalid amount' });
    }

    // Get current user from session
    // This is simplified - in production, validate the session properly
    const userRepo = repo(User);
    const transactionRepo = repo(CreditTransaction);

    // For MVP, we'll just find the first user (replace with proper session handling)
    const users = await userRepo.find();
    if (users.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const user = users[0];
    user.credits += amount;
    await userRepo.save(user);

    // Record transaction
    await transactionRepo.insert({
      userId: user.id,
      amount,
      balanceAfter: user.credits,
      description: `Credit purchase: ${amount} credits`,
    });

    return {
      success: true,
      newBalance: user.credits,
    };
  });

  // Get user credits
  app.get('/api/credits/balance', async (request, reply) => {
    const sessionId = request.headers['x-session-id'] as string;
    if (!sessionId) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const userRepo = repo(User);
    const users = await userRepo.find();
    if (users.length === 0) {
      return reply.code(404).send({ error: 'User not found' });
    }

    const user = users[0];

    return {
      balance: user.credits,
    };
  });
}
