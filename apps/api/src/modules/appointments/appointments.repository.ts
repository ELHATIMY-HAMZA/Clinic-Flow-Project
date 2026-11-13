import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  ListAppointmentsQuery,
  Paginated,
} from '@clinicflow/shared';
import { pool, type DbClient } from '../../config/db.js';
import { env } from '../../config/env.js';
import { buildMeta, toIso, toOffset } from '../../utils/pagination.js';

interface AppointmentJoinedRow {
  id: string;
  patient_id: string;
  patient_full_name: string;
  patient_cin: string;
  appointment_date: Date | string;
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  created_by: string;
  created_by_name: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface AppointmentLockRow {
  id: string;
  patient_id: string;
  appointment_date: Date | string;
  status: AppointmentStatus;
}

function mapAppointment(row: AppointmentJoinedRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientFullName: row.patient_full_name,
    patientCin: row.patient_cin,
    appointmentDate: toIso(row.appointment_date),
    status: row.status,
    reason: row.reason,
    notes: row.notes,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

const JOINED_SELECT = `
  SELECT a.id,
         a.patient_id,
         p.full_name AS patient_full_name,
         p.cin       AS patient_cin,
         a.appointment_date,
         a.status,
         a.reason,
         a.notes,
         a.created_by,
         u.full_name AS created_by_name,
         a.created_at,
         a.updated_at
    FROM public.appointments a
    JOIN public.patients p ON p.id = a.patient_id
    LEFT JOIN public.users u ON u.id = a.created_by
`;

export const appointmentsRepository = {
  async findById(id: string, client: DbClient = pool): Promise<Appointment | null> {
    const { rows } = await client.query<AppointmentJoinedRow>(
      `${JOINED_SELECT} WHERE a.id = $1 LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? mapAppointment(row) : null;
  },

  async findByIdForUpdate(id: string, client: DbClient): Promise<AppointmentLockRow | null> {
    const { rows } = await client.query<AppointmentLockRow>(
      `SELECT id, patient_id, appointment_date, status
         FROM public.appointments
        WHERE id = $1
          FOR UPDATE`,
      [id],
    );
    return rows[0] ?? null;
  },

  /**
   * Checks if the patient already has a confirmed appointment within (-30 min, +30 min)
   * of `appointmentDate`.
   */
  async hasConfirmedConflict(
    client: DbClient,
    patientId: string,
    appointmentDate: string | Date,
    excludeId?: string,
  ): Promise<boolean> {
    const iso = toIso(appointmentDate);
    const { rows } = await client.query<{ id: string }>(
      `SELECT id
         FROM public.appointments
        WHERE patient_id = $1
          AND status = 'confirmed'
          AND ($3::uuid IS NULL OR id <> $3)
          AND appointment_date > $2::timestamptz - interval '30 minutes'
          AND appointment_date < $2::timestamptz + interval '30 minutes'
        LIMIT 1`,
      [patientId, iso, excludeId ?? null],
    );
    return rows.length > 0;
  },

  async create(
    client: DbClient,
    input: CreateAppointmentInput,
    createdBy: string,
  ): Promise<Appointment> {
    const { rows } = await client.query<{ id: string }>(
      `INSERT INTO public.appointments
         (patient_id, appointment_date, status, reason, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [
        input.patientId,
        input.appointmentDate,
        input.status,
        input.reason,
        input.notes,
        createdBy,
      ],
    );
    const created = await this.findById(rows[0]!.id, client);
    return created!;
  },

  async updateStatus(
    client: DbClient,
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment | null> {
    const { rowCount } = await client.query(
      `UPDATE public.appointments SET status = $1 WHERE id = $2`,
      [status, id],
    );
    if (!rowCount) return null;
    return this.findById(id, client);
  },

  async list(query: ListAppointmentsQuery): Promise<Paginated<Appointment>> {
    const { page, limit, date, status, patientId } = query;
    const offset = toOffset(page, limit);

    const conditions: string[] = [];
    const params: unknown[] = [];

    if (date) {
      params.push(date, env.APP_TIMEZONE);
      const dateIdx = params.length - 1;
      const tzIdx = params.length;
      // Sargable range scan for the full calendar day in APP_TIMEZONE
      conditions.push(
        `a.appointment_date >= ($${dateIdx}::date)::timestamp AT TIME ZONE $${tzIdx}`,
        `a.appointment_date < (($${dateIdx}::date + 1)::timestamp) AT TIME ZONE $${tzIdx}`,
      );
    }

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (patientId) {
      params.push(patientId);
      conditions.push(`a.patient_id = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countSql = `SELECT count(*) AS count FROM public.appointments a ${whereClause}`;
    const dataSql = `
      ${JOINED_SELECT}
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.id DESC
      LIMIT $${params.length + 1}
      OFFSET $${params.length + 2}
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query<{ count: number }>(countSql, params),
      pool.query<AppointmentJoinedRow>(dataSql, [...params, limit, offset]),
    ]);

    const total = countRes.rows[0]?.count ?? 0;
    return {
      data: dataRes.rows.map(mapAppointment),
      meta: buildMeta(page, limit, total),
    };
  },

  async listByPatientId(patientId: string): Promise<Appointment[]> {
    const { rows } = await pool.query<AppointmentJoinedRow>(
      `${JOINED_SELECT}
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.id DESC`,
      [patientId],
    );
    return rows.map(mapAppointment);
  },
};
