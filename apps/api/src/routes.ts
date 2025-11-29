import type { FastifyInstance } from 'fastify';
import { repo } from 'remult';
import { User, CreditTransaction } from '@agenticcms/core';
import { createToken } from './auth.js';
import bcrypt from 'bcrypt';
import type { Env } from './env.js';

const SALT_ROUNDS = 10;

export function registerRoutes(app: FastifyInstance, env: Env) {
  // Login endpoint
  app.post('/api/auth/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    const userRepo = repo(User);
    const user = await userRepo.findFirst({ email });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Compare hashed password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = createToken(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      env
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    };
  });

  // Logout endpoint (with JWT, logout is handled client-side by removing token)
  app.post('/api/auth/logout', async (request, reply) => {
    // No server-side action needed for JWT
    // Client will remove the token from localStorage
    return { success: true };
  });

  // Register endpoint
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user with initial credits
    const user = await userRepo.insert({
      email,
      password: hashedPassword,
      name,
      role: role as any,
      credits: 100, // Give new users 100 credits
    });

    // Generate JWT token for immediate login
    const token = createToken(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      env
    );

    return {
      token,
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
    const remultInstance = (request as any).remult;
    if (!remultInstance?.user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { amount } = request.body as { amount: number };

    if (!amount || amount <= 0) {
      return reply.code(400).send({ error: 'Invalid amount' });
    }

    const userRepo = repo(User);
    const transactionRepo = repo(CreditTransaction);

    const user = await userRepo.findId(remultInstance.user.id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

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
    const remultInstance = (request as any).remult;
    if (!remultInstance?.user) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const userRepo = repo(User);
    const user = await userRepo.findId(remultInstance.user.id);
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    return {
      balance: user.credits,
    };
  });
}
