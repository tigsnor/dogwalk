export type UserRole = 'owner' | 'walker' | 'admin';

export type AuthUser = {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  passwordHash: string;
};
