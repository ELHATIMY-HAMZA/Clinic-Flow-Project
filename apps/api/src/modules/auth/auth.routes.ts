import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginSchema, type ApiErrorBody } from '@clinicflow/shared';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { authController } from './auth.controller.js';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Trop de tentatives de connexion. Réessayez dans quelques minutes.',
    },
  } satisfies ApiErrorBody,
});

export const authRouter = Router();

authRouter.post('/login', loginLimiter, validate({ body: loginSchema }), authController.login);
authRouter.get('/me', authenticate, authController.me);
