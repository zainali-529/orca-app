import api from '@/lib/api';
import type {
  ApiResponse,
  AuthTokens,
  LoginPayload,
  RegisterPayload,
  User,
} from '@/lib/types/auth.types';

// ── Register ───────────────────────────────────────────────
export const registerApi = (payload: RegisterPayload) =>
  api.post<ApiResponse<{ user: User }>>('/auth/register', payload);

// ── Login ──────────────────────────────────────────────────
export const loginApi = (payload: LoginPayload) =>
  api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/login', payload);

// ── Get current user ───────────────────────────────────────
export const getMeApi = () =>
  api.get<ApiResponse<{ user: User }>>('/auth/me');

// ── Logout ─────────────────────────────────────────────────
export const logoutApi = (refreshToken: string) =>
  api.post<ApiResponse>('/auth/logout', { refreshToken });

// ── Refresh ────────────────────────────────────────────────
export const refreshTokenApi = (refreshToken: string) =>
  api.post<ApiResponse<{ user: User } & AuthTokens>>('/auth/refresh', { refreshToken });