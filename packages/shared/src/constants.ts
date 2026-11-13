export const USER_ROLES = ['admin', 'staff'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const APPOINTMENT_STATUSES = ['pending', 'confirmed', 'cancelled'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/** Minimum gap (minutes) between two confirmed appointments of the same patient. */
export const CONFIRMED_APPOINTMENT_GAP_MINUTES = 30;

export const PAGINATION = { defaultLimit: 10, maxLimit: 100 } as const;
