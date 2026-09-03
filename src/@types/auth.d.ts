export interface IAuthUser {
  externalId: string;
  email: string;
  name: string | null;
  lastLoginAt: string | null;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}
