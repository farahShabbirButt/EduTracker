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

export interface IUpdateProfilePayload {
  name: string;
  email: string;
  currentPassword?: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IResetPasswordPayload {
  token: string;
  newPassword: string;
}
