import type { User, UserRole } from '@clinicflow/shared';
import { pool } from '../../config/db.js';
import { toIso } from '../../utils/pagination.js';

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date | string;
}

export interface UserWithPassword {
  user: User;
  passwordHash: string;
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    createdAt: toIso(row.created_at),
  };
}

export const authRepository = {
  async findByEmail(email: string): Promise<UserWithPassword | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, full_name, email, password_hash, role, created_at
         FROM public.users
        WHERE lower(email) = lower($1)
        LIMIT 1`,
      [email],
    );
    const row = rows[0];
    if (!row) return null;
    return { user: mapUser(row), passwordHash: row.password_hash };
  },

  async findById(id: string): Promise<User | null> {
    const { rows } = await pool.query<UserRow>(
      `SELECT id, full_name, email, password_hash, role, created_at
         FROM public.users
        WHERE id = $1
        LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? mapUser(row) : null;
  },
};
