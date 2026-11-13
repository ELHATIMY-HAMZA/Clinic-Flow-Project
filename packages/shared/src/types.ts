import type { AppointmentStatus, UserRole } from './constants.js';

/** Public user representation (never includes the password hash). */
export interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Patient {
  id: string;
  fullName: string;
  cin: string;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  address: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientFullName: string;
  patientCin: string;
  appointmentDate: string; // ISO 8601
  status: AppointmentStatus;
  reason: string;
  notes: string | null;
  createdBy: string;
  createdByName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  confirmedAppointments: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'TOO_MANY_REQUESTS'
  | 'INTERNAL_ERROR';

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, string[]>;
  };
}
