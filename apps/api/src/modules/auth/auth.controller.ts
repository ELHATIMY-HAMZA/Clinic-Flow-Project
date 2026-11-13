import type { Request, Response } from 'express';
import type { LoginInput } from '@clinicflow/shared';
import { UnauthorizedError } from '../../utils/AppError.js';
import { authService } from './auth.service.js';

export const authController = {
  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body as LoginInput);
    res.status(200).json(result);
  },

  async me(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const user = await authService.getMe(req.user.id);
    res.status(200).json({ user });
  },
};
