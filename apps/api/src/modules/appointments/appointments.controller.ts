import type { Request, Response } from 'express';
import type {
  CreateAppointmentInput,
  ListAppointmentsQuery,
  UpdateAppointmentStatusInput,
} from '@clinicflow/shared';
import { UnauthorizedError } from '../../utils/AppError.js';
import { appointmentsService } from './appointments.service.js';

export const appointmentsController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await appointmentsService.list(req.query as unknown as ListAppointmentsQuery);
    res.status(200).json(result);
  },

  async listByPatient(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const data = await appointmentsService.listByPatient(id);
    res.status(200).json({ data });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const appointment = await appointmentsService.create(
      req.body as CreateAppointmentInput,
      req.user.id,
    );
    res.status(201).json({ data: appointment });
  },

  async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const { status } = req.body as UpdateAppointmentStatusInput;
    const appointment = await appointmentsService.updateStatus(id, status);
    res.status(200).json({ data: appointment });
  },
};
