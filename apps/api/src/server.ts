import fastify from 'fastify';
import cors from '@fastify/cors';
import { remultFastify } from 'remult/remult-fastify';
import { createPostgresDataProvider } from 'remult/postgres';
import * as entities from '@agenticcms/core';
import dotenv from 'dotenv';
import { createAuthMiddleware } from './auth';
import { registerRoutes } from './routes';

dotenv.config();

const app = fastify({
  logger: true,
});

// Enable CORS
await app.register(cors, {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
});

// Setup Remult with PostgreSQL
const api = remultFastify({
  entities: Object.values(entities).filter(e => typeof e === 'function' && e.prototype),
  dataProvider: async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    return createPostgresDataProvider({ connectionString });
  },
  getUser: createAuthMiddleware(),
});

app.register(api);

// Register custom routes (credit purchases, etc.)
registerRoutes(app);

// Health check
app.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const PORT = parseInt(process.env.PORT || '3001', 10);
const HOST = process.env.HOST || '0.0.0.0';

async function start() {
  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Server running at http://${HOST}:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
