export interface User {
  id: number;
  roleId: number;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  roleId: number;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
}
