import fastify from 'fastify';
import cors from '@fastify/cors';
import { remultFastify } from 'remult/remult-fastify';
import { createPostgresDataProvider } from 'remult/postgres';
import {
  User,
  CreditTransaction,
  Artifact,
  Classroom,
  StudentProfile,
  LessonPlan
} from '@agenticcms/core';
import dotenv from 'dotenv';
import { createAuthMiddleware } from './auth.js';
import { registerRoutes } from './routes.js';
import { validateEnv } from './env.js';
import { globalErrorHandler, notFoundHandler } from './error-handler.js';

// Load environment variables
dotenv.config();

// Validate environment variables
const env = validateEnv();

console.log('✅ Environment variables validated');
console.log(`📦 Environment: ${env.NODE_ENV}`);
console.log(`🌐 API Port: ${env.PORT}`);
console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);

const app = fastify({
  logger: true,
});

// Enable CORS
await app.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
});

// Setup Remult with PostgreSQL
const api = remultFastify({
  entities: [User, CreditTransaction, Artifact, Classroom, StudentProfile, LessonPlan],
  dataProvider: createPostgresDataProvider({ connectionString: env.DATABASE_URL }),
  getUser: createAuthMiddleware(env),
});

await app.register(api);

// Register custom routes (credit purchases, etc.)
registerRoutes(app, env);

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register error handlers
app.setErrorHandler(globalErrorHandler);
app.setNotFoundHandler(notFoundHandler);

const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: env.PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
