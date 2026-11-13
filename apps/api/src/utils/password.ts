import bcrypt from 'bcrypt';
import { env } from '../config/env.js';

export const hashPassword = (plain: string): Promise<string> => bcrypt.hash(plain, env.BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, hash: string): Promise<boolean> => bcrypt.compare(plain, hash);

/**
 * A valid bcrypt hash used when the email does not exist, so that the login
 * response time does not reveal whether an account exists (user enumeration).
 */
export const DUMMY_HASH = bcrypt.hashSync('clinicflow-timing-equalizer', env.BCRYPT_ROUNDS);
