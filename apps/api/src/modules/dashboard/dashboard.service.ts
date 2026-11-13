import type { DashboardStats } from '@clinicflow/shared';
import { pool } from '../../config/db.js';
import { env } from '../../config/env.js';

interface StatsRow {
  total_patients: number;
  today_appointments: number;
  pending_appointments: number;
  confirmed_appointments: number;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { rows } = await pool.query<StatsRow>(
      `WITH today_bounds AS (
         SELECT ((now() AT TIME ZONE $1)::date)::timestamp AT TIME ZONE $1       AS start_ts,
                (((now() AT TIME ZONE $1)::date + 1)::timestamp) AT TIME ZONE $1 AS end_ts
       )
       SELECT
         (SELECT count(*) FROM public.patients) AS total_patients,
         (SELECT count(*)
            FROM public.appointments a, today_bounds b
           WHERE a.appointment_date >= b.start_ts
             AND a.appointment_date <  b.end_ts) AS today_appointments,
         (SELECT count(*)
            FROM public.appointments
           WHERE status = 'pending') AS pending_appointments,
         (SELECT count(*)
            FROM public.appointments
           WHERE status = 'confirmed') AS confirmed_appointments`,
      [env.APP_TIMEZONE],
    );

    const row = rows[0];
    return {
      totalPatients: row?.total_patients ?? 0,
      todayAppointments: row?.today_appointments ?? 0,
      pendingAppointments: row?.pending_appointments ?? 0,
      confirmedAppointments: row?.confirmed_appointments ?? 0,
    };
  },
};
