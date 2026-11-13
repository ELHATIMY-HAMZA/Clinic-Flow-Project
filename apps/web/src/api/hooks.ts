import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentInput,
  DashboardStats,
  ListAppointmentsQuery,
  ListPatientsQuery,
  Paginated,
  Patient,
  PatientInput,
} from '@clinicflow/shared';
import { apiClient } from './client.js';

export const queryKeys = {
  dashboard: ['dashboard', 'stats'] as const,
  patients: {
    all: ['patients'] as const,
    list: (params: Partial<ListPatientsQuery>) => ['patients', 'list', params] as const,
    detail: (id: string) => ['patients', 'detail', id] as const,
    appointments: (id: string) => ['patients', 'detail', id, 'appointments'] as const,
  },
  appointments: {
    all: ['appointments'] as const,
    list: (params: Partial<ListAppointmentsQuery>) => ['appointments', 'list', params] as const,
  },
};

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: DashboardStats }>('/dashboard/stats');
      return data.data;
    },
  });
}

export function usePatientsList(params: Partial<ListPatientsQuery>) {
  return useQuery({
    queryKey: queryKeys.patients.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Patient>>('/patients', { params });
      return data;
    },
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: queryKeys.patients.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Patient }>(`/patients/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: queryKeys.patients.appointments(patientId),
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Appointment[] }>(
        `/patients/${patientId}/appointments`,
      );
      return data.data;
    },
    enabled: Boolean(patientId),
  });
}

export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PatientInput) => {
      const { data } = await apiClient.post<{ data: Patient }>('/patients', input);
      return data.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: PatientInput }) => {
      const { data } = await apiClient.put<{ data: Patient }>(`/patients/${id}`, input);
      return data.data;
    },
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      void qc.invalidateQueries({ queryKey: queryKeys.patients.detail(updated.id) });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.patients.all });
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useAppointmentsList(params: Partial<ListAppointmentsQuery>) {
  return useQuery({
    queryKey: queryKeys.appointments.list(params),
    queryFn: async () => {
      const { data } = await apiClient.get<Paginated<Appointment>>('/appointments', { params });
      return data;
    },
  });
}

export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const { data } = await apiClient.post<{ data: Appointment }>('/appointments', input);
      return data.data;
    },
    onSuccess: (created) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void qc.invalidateQueries({ queryKey: queryKeys.patients.appointments(created.patientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { data } = await apiClient.patch<{ data: Appointment }>(`/appointments/${id}/status`, {
        status,
      });
      return data.data;
    },
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: queryKeys.appointments.all });
      void qc.invalidateQueries({ queryKey: queryKeys.patients.appointments(updated.patientId) });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
  });
}
