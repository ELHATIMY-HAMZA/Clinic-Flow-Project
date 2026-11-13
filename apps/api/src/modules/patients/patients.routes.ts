import { Router } from 'express';
import { listPatientsQuerySchema, patientSchema, uuidParamSchema } from '@clinicflow/shared';
import { authenticate } from '../../middlewares/auth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { validate } from '../../middlewares/validate.js';
import { appointmentsController } from '../appointments/appointments.controller.js';
import { patientsController } from './patients.controller.js';

export const patientsRouter = Router();

patientsRouter.use(authenticate);

patientsRouter.get('/', validate({ query: listPatientsQuerySchema }), patientsController.list);
patientsRouter.post('/', validate({ body: patientSchema }), patientsController.create);
patientsRouter.get('/:id', validate({ params: uuidParamSchema }), patientsController.getById);
patientsRouter.get(
  '/:id/appointments',
  validate({ params: uuidParamSchema }),
  appointmentsController.listByPatient,
);
patientsRouter.put(
  '/:id',
  validate({ params: uuidParamSchema, body: patientSchema }),
  patientsController.update,
);
patientsRouter.delete(
  '/:id',
  requireRole('admin'),
  validate({ params: uuidParamSchema }),
  patientsController.remove,
);
