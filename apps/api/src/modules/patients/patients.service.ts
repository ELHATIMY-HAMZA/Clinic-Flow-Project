import type { ListPatientsQuery, Paginated, Patient, PatientInput } from '@clinicflow/shared';
import { NotFoundError } from '../../utils/AppError.js';
import { patientsRepository } from './patients.repository.js';

const PATIENT_NOT_FOUND = 'Patient introuvable';

export const patientsService = {
  async list(query: ListPatientsQuery): Promise<Paginated<Patient>> {
    return patientsRepository.list(query);
  },

  async getById(id: string): Promise<Patient> {
    const patient = await patientsRepository.findById(id);
    if (!patient) {
      throw new NotFoundError(PATIENT_NOT_FOUND);
    }
    return patient;
  },

  async create(input: PatientInput, createdBy: string): Promise<Patient> {
    return patientsRepository.create(input, createdBy);
  },

  async update(id: string, input: PatientInput): Promise<Patient> {
    const updated = await patientsRepository.update(id, input);
    if (!updated) {
      throw new NotFoundError(PATIENT_NOT_FOUND);
    }
    return updated;
  },

  async remove(id: string): Promise<void> {
    const deleted = await patientsRepository.remove(id);
    if (!deleted) {
      throw new NotFoundError(PATIENT_NOT_FOUND);
    }
  },
};
