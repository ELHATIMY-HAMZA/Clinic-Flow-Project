/**
 * Test data seed — 1 admin, 2 staff, 5 patients, 10 appointments (pending/confirmed/cancelled).
 *
 *   npm run db:seed                 wipe ClinicFlow tables and re-insert the dataset
 *   npm run db:seed -- --if-empty   only seed when there are no users yet (used by Docker on boot)
 *
 * Appointment times are relative to "today" in APP_TIMEZONE so the dashboard always has data.
 */
import bcrypt from 'bcrypt';
import { env } from '../src/config/env.js';
import { pool, withTransaction } from '../src/config/db.js';

const USERS = [
  { fullName: 'Amina El Idrissi', email: 'admin@clinicflow.ma', password: 'Admin123!', role: 'admin' },
  { fullName: 'Youssef Benali', email: 'staff1@clinicflow.ma', password: 'Staff123!', role: 'staff' },
  { fullName: 'Salma Tazi', email: 'staff2@clinicflow.ma', password: 'Staff123!', role: 'staff' },
] as const;

const PATIENTS = [
  { fullName: 'Mohamed Alaoui', cin: 'AB123456', phone: '+212 661 234 567', birthDate: '1985-03-12', address: '12 Rue Ibn Sina, Rabat' },
  { fullName: 'Fatima Zahra Bennani', cin: 'BE789012', phone: '+212 662 345 678', birthDate: '1992-07-25', address: '45 Bd Zerktouni, Casablanca' },
  { fullName: 'Karim Chraibi', cin: 'C345678', phone: '0663456789', birthDate: '1978-11-02', address: null },
  { fullName: 'Nadia Ouazzani', cin: 'D901234', phone: '0664567890', birthDate: '2001-01-18', address: '8 Av. Hassan II, Fès' },
  { fullName: 'Omar Fassi Fihri', cin: 'EE567890', phone: '+212 665 678 901', birthDate: '1965-09-30', address: 'Résidence Al Andalous, Marrakech' },
] as const;

// [dayOffset, localTime, patientIndex, status, reason, createdByIndex, notes]
const APPOINTMENTS: [number, string, number, string, string, number, string | null][] = [
  [0, '09:00', 0, 'confirmed', 'Consultation générale', 1, null],
  [0, '10:30', 1, 'confirmed', 'Suivi tension artérielle', 1, 'Apporter le carnet de suivi'],
  [0, '11:00', 2, 'pending', 'Douleurs lombaires', 2, null],
  [0, '14:00', 3, 'pending', "Renouvellement d'ordonnance", 2, null],
  [0, '15:30', 0, 'cancelled', 'Bilan sanguin', 0, 'Annulé par le patient'],
  [1, '09:30', 4, 'confirmed', 'Vaccination', 1, null],
  [1, '11:00', 1, 'pending', 'Contrôle post-opératoire', 2, null],
  [2, '10:00', 2, 'confirmed', "Résultats d'analyses", 0, null],
  [-1, '16:00', 3, 'cancelled', 'Consultation dermatologique', 1, null],
  [3, '09:00', 4, 'pending', 'Certificat médical', 2, null],
];

async function seed(): Promise<void> {
  if (env.NODE_ENV === 'production' && !process.argv.includes('--if-empty')) {
    throw new Error('Refusing to wipe data in production (use --if-empty)');
  }

  if (process.argv.includes('--if-empty')) {
    const { rows } = await pool.query<{ count: number }>('SELECT count(*) AS count FROM public.users');
    if ((rows[0]?.count ?? 0) > 0) {
      console.log('ℹ️  Users already exist — seed skipped');
      return;
    }
  }

  const hashes = await Promise.all(USERS.map((u) => bcrypt.hash(u.password, env.BCRYPT_ROUNDS)));

  await withTransaction(async (client) => {
    await client.query('TRUNCATE public.appointments, public.patients, public.users CASCADE');

    const userIds: string[] = [];
    for (const [i, u] of USERS.entries()) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO public.users (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [u.fullName, u.email, hashes[i], u.role],
      );
      userIds.push(rows[0]!.id);
    }

    const patientIds: string[] = [];
    for (const [i, p] of PATIENTS.entries()) {
      const { rows } = await client.query<{ id: string }>(
        `INSERT INTO public.patients (full_name, cin, phone, birth_date, address, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [p.fullName, p.cin, p.phone, p.birthDate, p.address, userIds[i % userIds.length]],
      );
      patientIds.push(rows[0]!.id);
    }

    for (const [dayOffset, time, pIdx, status, reason, uIdx, notes] of APPOINTMENTS) {
      // (local date + local time) interpreted in APP_TIMEZONE → timestamptz
      await client.query(
        `INSERT INTO public.appointments (patient_id, appointment_date, status, reason, notes, created_by)
         VALUES ($1,
                 (((now() AT TIME ZONE $7)::date + $2::int) + $3::time) AT TIME ZONE $7,
                 $4, $5, $6, $8)`,
        [patientIds[pIdx], dayOffset, time, status, reason, notes, env.APP_TIMEZONE, userIds[uIdx]],
      );
    }
  });

  console.log(`✅ Seeded ${USERS.length} users, ${PATIENTS.length} patients, ${APPOINTMENTS.length} appointments`);
  console.log('   admin@clinicflow.ma / Admin123!   ·   staff1@clinicflow.ma, staff2@clinicflow.ma / Staff123!');
}

try {
  await seed();
} catch (err) {
  console.error(err);
  process.exitCode = 1;
} finally {
  await pool.end();
}
