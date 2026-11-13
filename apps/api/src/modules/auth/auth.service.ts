import type { LoginInput, LoginResponse, User } from '@clinicflow/shared';
import { UnauthorizedError } from '../../utils/AppError.js';
import { signToken } from '../../utils/jwt.js';
import { DUMMY_HASH, verifyPassword } from '../../utils/password.js';
import { authRepository } from './auth.repository.js';

const INVALID_CREDENTIALS_MESSAGE = 'Email ou mot de passe incorrect';

export const authService = {
  async login(input: LoginInput): Promise<LoginResponse> {
    const found = await authRepository.findByEmail(input.email);
    const hashToCheck = found ? found.passwordHash : DUMMY_HASH;
    const valid = await verifyPassword(input.password, hashToCheck);

    if (!found || !valid) {
      throw new UnauthorizedError(INVALID_CREDENTIALS_MESSAGE);
    }

    const token = signToken({ sub: found.user.id, role: found.user.role });
    return { token, user: found.user };
  },

  async getMe(userId: string): Promise<User> {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('Utilisateur introuvable ou session invalide');
    }
    return user;
  },
};
