import type { Request, Response } from 'express';
import type { ListPatientsQuery, PatientInput } from '@clinicflow/shared';
import { UnauthorizedError } from '../../utils/AppError.js';
import { patientsService } from './patients.service.js';

export const patientsController = {
  async list(req: Request, res: Response): Promise<void> {
    const result = await patientsService.list(req.query as unknown as ListPatientsQuery);
    res.status(200).json(result);
  },

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const patient = await patientsService.getById(id);
    res.status(200).json({ data: patient });
  },

  async create(req: Request, res: Response): Promise<void> {
    if (!req.user) throw new UnauthorizedError();
    const patient = await patientsService.create(req.body as PatientInput, req.user.id);
    res.status(201).json({ data: patient });
  },

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    const patient = await patientsService.update(id, req.body as PatientInput);
    res.status(200).json({ data: patient });
  },

  async remove(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };
    await patientsService.remove(id);
    res.status(204).send();
  },
};
