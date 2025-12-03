import { User } from '@prisma/client';

/**
 * User type without password field
 */
export type UserWithoutPassword = Omit<User, 'password'>;

