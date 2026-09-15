import { AppError } from "../../utils/app-error.js";
import { createUser, findUserByEmail } from "./auth.repository.js";
import { comparePassword, hashPassword } from "./password.service.js";
import type { LoginInput, RegisterInput } from "./auth.schema.js";
import type { User } from "./auth.types.js";
import { generateAccessToken, generateRefreshToken } from "./token.service.js";

export async function registerUser(input: RegisterInput): Promise<User> {
  const existingUser = await findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser({
    roleId: 1,
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    isActive: true,
  });

  return user;
}

export async function loginUser(input: LoginInput): Promise<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {
  const user = await findUserByEmail(input.email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw new AppError("Account is inactive", 403);
  }

  if (!user.passwordHash) {
    throw new AppError("This account does not support password login", 401);
  }

  const passwordMatches = await comparePassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user.id, user.roleId);
  const refreshToken = generateRefreshToken(user.id);

  return { user, accessToken, refreshToken };
}
