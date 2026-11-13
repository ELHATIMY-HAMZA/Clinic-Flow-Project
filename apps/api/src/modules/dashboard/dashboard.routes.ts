import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { dashboardController } from './dashboard.controller.js';

export const dashboardRouter = Router();

dashboardRouter.use(authenticate);
dashboardRouter.get('/stats', dashboardController.getStats);
