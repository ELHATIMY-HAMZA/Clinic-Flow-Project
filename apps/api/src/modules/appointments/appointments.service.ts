import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  ListAppointmentsQuery,
  Paginated,
} from '@clinicflow/shared';
import { withTransaction } from '../../config/db.js';
import { ConflictError, NotFoundError } from '../../utils/AppError.js';
import { CONFIRMED_CONFLICT_MESSAGE } from '../../utils/pgErrors.js';
import { patientsRepository } from '../patients/patients.repository.js';
import { appointmentsRepository } from './appointments.repository.js';

const APPOINTMENT_NOT_FOUND = 'Rendez-vous introuvable';

export const appointmentsService = {
  async list(query: ListAppointmentsQuery): Promise<Paginated<Appointment>> {
    return appointmentsRepository.list(query);
  },

  async listByPatient(patientId: string): Promise<Appointment[]> {
    const patient = await patientsRepository.findById(patientId);
    if (!patient) {
      throw new NotFoundError('Patient introuvable');
    }
    return appointmentsRepository.listByPatientId(patientId);
  },

  async create(input: CreateAppointmentInput, createdBy: string): Promise<Appointment> {
    const patient = await patientsRepository.findById(input.patientId);
    if (!patient) {
      throw new NotFoundError('Patient introuvable');
    }

    return withTransaction(async (client) => {
      if (input.status === 'confirmed') {
        const conflict = await appointmentsRepository.hasConfirmedConflict(
          client,
          input.patientId,
          input.appointmentDate,
        );
        if (conflict) {
          throw new ConflictError(CONFIRMED_CONFLICT_MESSAGE);
        }
      }

      return appointmentsRepository.create(client, input, createdBy);
    });
  },

  async updateStatus(id: string, status: AppointmentStatus): Promise<Appointment> {
    return withTransaction(async (client) => {
      const existing = await appointmentsRepository.findByIdForUpdate(id, client);
      if (!existing) {
        throw new NotFoundError(APPOINTMENT_NOT_FOUND);
      }

      if (status === 'confirmed' && existing.status !== 'confirmed') {
        const conflict = await appointmentsRepository.hasConfirmedConflict(
          client,
          existing.patient_id,
          existing.appointment_date,
          id,
        );
        if (conflict) {
          throw new ConflictError(CONFIRMED_CONFLICT_MESSAGE);
        }
      }

      const updated = await appointmentsRepository.updateStatus(client, id, status);
      if (!updated) {
        throw new NotFoundError(APPOINTMENT_NOT_FOUND);
      }
      return updated;
    });
  },
};
