import type { ListPatientsQuery, Paginated, Patient, PatientInput } from '@clinicflow/shared';
import { pool } from '../../config/db.js';
import { buildMeta, containsPattern, toIso, toOffset } from '../../utils/pagination.js';

interface PatientRow {
  id: string;
  full_name: string;
  cin: string;
  phone: string;
  birth_date: string;
  address: string | null;
  created_by: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    fullName: row.full_name,
    cin: row.cin,
    phone: row.phone,
    birthDate: row.birth_date,
    address: row.address,
    createdBy: row.created_by,
    createdAt: toIso(row.created_at),
    updatedAt: toIso(row.updated_at),
  };
}

const SELECT_COLUMNS = `
  id, full_name, cin, phone, birth_date, address, created_by, created_at, updated_at
`;

export const patientsRepository = {
  async list(query: ListPatientsQuery): Promise<Paginated<Patient>> {
    const { page, limit, search } = query;
    const offset = toOffset(page, limit);

    const hasSearch = Boolean(search && search.length > 0);
    const whereClause = hasSearch
      ? `WHERE (full_name ILIKE $1 ESCAPE '\\' OR cin ILIKE $1 ESCAPE '\\')`
      : '';
    const filterParams = hasSearch ? [containsPattern(search!)] : [];

    const countSql = `SELECT count(*) AS count FROM public.patients ${whereClause}`;
    const dataSql = `
      SELECT ${SELECT_COLUMNS}
        FROM public.patients
        ${whereClause}
       ORDER BY created_at DESC, id DESC
       LIMIT $${filterParams.length + 1}
      OFFSET $${filterParams.length + 2}
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query<{ count: number }>(countSql, filterParams),
      pool.query<PatientRow>(dataSql, [...filterParams, limit, offset]),
    ]);

    const total = countRes.rows[0]?.count ?? 0;
    return {
      data: dataRes.rows.map(mapPatient),
      meta: buildMeta(page, limit, total),
    };
  },

  async findById(id: string): Promise<Patient | null> {
    const { rows } = await pool.query<PatientRow>(
      `SELECT ${SELECT_COLUMNS} FROM public.patients WHERE id = $1 LIMIT 1`,
      [id],
    );
    const row = rows[0];
    return row ? mapPatient(row) : null;
  },

  async create(input: PatientInput, createdBy: string): Promise<Patient> {
    const { rows } = await pool.query<PatientRow>(
      `INSERT INTO public.patients (full_name, cin, phone, birth_date, address, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING ${SELECT_COLUMNS}`,
      [input.fullName, input.cin, input.phone, input.birthDate, input.address, createdBy],
    );
    return mapPatient(rows[0]!);
  },

  async update(id: string, input: PatientInput): Promise<Patient | null> {
    const { rows } = await pool.query<PatientRow>(
      `UPDATE public.patients
          SET full_name  = $1,
              cin        = $2,
              phone      = $3,
              birth_date = $4,
              address    = $5
        WHERE id = $6
        RETURNING ${SELECT_COLUMNS}`,
      [input.fullName, input.cin, input.phone, input.birthDate, input.address, id],
    );
    const row = rows[0];
    return row ? mapPatient(row) : null;
  },

  async remove(id: string): Promise<boolean> {
    const res = await pool.query(`DELETE FROM public.patients WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  },
};
