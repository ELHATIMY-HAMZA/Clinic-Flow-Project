import type { Request, Response } from 'express';
import { dashboardService } from './dashboard.service.js';

export const dashboardController = {
  async getStats(_req: Request, res: Response): Promise<void> {
    const stats = await dashboardService.getStats();
    res.status(200).json({ data: stats });
  },
};
