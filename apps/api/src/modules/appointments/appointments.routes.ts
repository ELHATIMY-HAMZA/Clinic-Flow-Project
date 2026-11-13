import { Router } from 'express';
import {
  createAppointmentSchema,
  listAppointmentsQuerySchema,
  updateAppointmentStatusSchema,
  uuidParamSchema,
} from '@clinicflow/shared';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { appointmentsController } from './appointments.controller.js';

export const appointmentsRouter = Router();

appointmentsRouter.use(authenticate);

appointmentsRouter.get(
  '/',
  validate({ query: listAppointmentsQuerySchema }),
  appointmentsController.list,
);
appointmentsRouter.post(
  '/',
  validate({ body: createAppointmentSchema }),
  appointmentsController.create,
);
appointmentsRouter.patch(
  '/:id/status',
  validate({ params: uuidParamSchema, body: updateAppointmentStatusSchema }),
  appointmentsController.updateStatus,
);
