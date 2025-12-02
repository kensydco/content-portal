import express from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import { env, validateEnv } from './utils/env';
import { logger } from './utils/logger';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiRateLimiter } from './middleware/rateLimiter';

// Validate environment variables
try {
  validateEnv();
  logger.info('Environment variables validated successfully');
} catch (error) {
  logger.error('Environment validation failed', error);
  process.exit(1);
}

const app = express();

// Trust proxy (required for Cloud Run)
app.set('trust proxy', 1);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
      },
    },
  })
);

// CORS - Allow requests from same origin in production
// In development, allow localhost:5173
const corsOptions = {
  origin:
    env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'http://localhost:8080']
      : true,
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes with rate limiting
app.use('/api', apiRateLimiter, apiRoutes);

// Serve static files from React build (production)
if (env.NODE_ENV === 'production') {
  const clientPath = path.join(__dirname, '../public');
  app.use(express.static(clientPath));

  // SPA fallback - serve index.html for any non-API route
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  // Development mode - API only
  app.get('/', (req, res) => {
    res.json({
      message: 'Content Ingest Portal API',
      environment: env.NODE_ENV,
      docs: '/api/health',
    });
  });
}

// Error handlers (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = parseInt(env.PORT);

app.listen(PORT, () => {
  logger.info(`Server started in ${env.NODE_ENV} mode`, {
    port: PORT,
    nodeVersion: process.version,
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
