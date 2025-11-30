import type { FastifyInstance } from 'fastify';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import type { Env } from './env.js';

/**
 * Configure rate limiting for API endpoints
 * Prevents brute force attacks and API abuse
 */
export async function configureRateLimiting(app: FastifyInstance, env: Env) {
  await app.register(rateLimit, {
    global: false, // We'll apply selectively
    max: 100, // Maximum requests per time window
    timeWindow: '15 minutes', // Time window for rate limiting
    cache: 10000, // Number of unique IPs to track
    allowList: ['127.0.0.1'], // Whitelist for local development
    redis: undefined, // TODO: Add Redis support for production
    skipOnError: env.NODE_ENV === 'development', // Skip in dev if rate limit fails
    keyGenerator: (request) => {
      // Use IP address as key, fallback to a default
      return request.ip || 'unknown';
    },
    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Retry after ${Math.ceil(context.ttl / 1000)} seconds.`,
      };
    },
  });

  console.log('✅ Rate limiting configured (100 req/15min)');
}

/**
 * Configure strict rate limiting for authentication endpoints
 * Prevents brute force password attacks
 */
export async function configureAuthRateLimiting(app: FastifyInstance) {
  // Stricter rate limiting for login/register
  await app.register(rateLimit, {
    max: 5, // Only 5 attempts
    timeWindow: '15 minutes',
    cache: 10000,
    keyGenerator: (request) => {
      // Rate limit by IP for auth endpoints
      return `auth:${request.ip || 'unknown'}`;
    },
    errorResponseBuilder: (request, context) => {
      return {
        statusCode: 429,
        error: 'Too Many Requests',
        message: `Too many login attempts. Please wait ${Math.ceil(context.ttl / 1000)} seconds before trying again.`,
      };
    },
  });

  console.log('✅ Auth rate limiting configured (5 req/15min)');
}

/**
 * Configure security headers using Helmet
 * Protects against common web vulnerabilities
 */
export async function configureSecurityHeaders(app: FastifyInstance) {
  await app.register(helmet, {
    // Content Security Policy
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles for now
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    // Strict Transport Security
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    // Prevent clickjacking
    frameguard: {
      action: 'deny',
    },
    // Prevent MIME sniffing
    noSniff: true,
    // XSS Protection
    xssFilter: true,
    // Hide X-Powered-By header
    hidePoweredBy: true,
  });

  console.log('✅ Security headers configured (Helmet)');
}

/**
 * Request validation middleware
 * Validates request size and content type
 */
export function configureRequestValidation(app: FastifyInstance) {
  // Limit request body size
  app.addHook('onRequest', async (request, reply) => {
    const contentLength = request.headers['content-length'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (contentLength && parseInt(contentLength, 10) > maxSize) {
      reply.code(413).send({
        statusCode: 413,
        error: 'Payload Too Large',
        message: 'Request body exceeds maximum size of 10MB',
      });
    }
  });

  // Validate content type for POST/PUT/PATCH
  app.addHook('onRequest', async (request, reply) => {
    const methods = ['POST', 'PUT', 'PATCH'];
    if (methods.includes(request.method)) {
      const contentType = request.headers['content-type'];
      if (!contentType) {
        reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Content-Type header is required',
        });
      }
    }
  });

  console.log('✅ Request validation configured');
}

/**
 * Configure all security middleware
 */
export async function configureSecurity(app: FastifyInstance, env: Env) {
  // Apply security headers
  await configureSecurityHeaders(app);

  // Apply general rate limiting
  await configureRateLimiting(app, env);

  // Apply request validation
  configureRequestValidation(app);

  console.log('🔒 All security middleware configured');
}
