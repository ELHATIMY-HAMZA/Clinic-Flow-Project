import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { pool } from './config/db.js';
import { env } from './config/env.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFound.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { patientsRouter } from './modules/patients/patients.routes.js';
import { logger } from './utils/logger.js';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  app.use(
    pinoHttp({
      logger,
      autoLogging: {
        ignore: (req) => req.url === '/api/health',
      },
    }),
  );

  app.get('/api/health', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: 'degraded', timestamp: new Date().toISOString() });
    }
  });

  app.use('/api/auth', authRouter);
  app.use('/api/patients', patientsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
