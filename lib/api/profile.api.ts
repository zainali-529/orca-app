import api from '@/lib/api-instance';
import type { ApiResponse } from '@/lib/types/auth.types';
import type {
  OnboardingStatus,
  Step1Payload,
  Step2Payload,
  Step3Payload,
  Step4Payload,
  Step5Payload,
  UserProfile,
} from '@/lib/types/profile.types';

// ── Profile ────────────────────────────────────────────────
export const getProfileApi = () =>
  api.get<ApiResponse<{ profile: UserProfile; user: any }>>('/profile');

export const updateProfileApi = (data: Partial<UserProfile>) =>
  api.patch<ApiResponse<{ profile: UserProfile }>>('/profile', data);

// ── Onboarding ─────────────────────────────────────────────
export const getOnboardingStatusApi = () =>
  api.get<ApiResponse<OnboardingStatus>>('/profile/onboarding/status');

export const saveStep1Api = (data: Step1Payload) =>
  api.post<ApiResponse<{ profile: UserProfile; nextStep: number }>>('/profile/onboarding/step/1', data);

export const saveStep2Api = (data: Step2Payload) =>
  api.post<ApiResponse<{ profile: UserProfile; nextStep: number; skipped?: boolean }>>('/profile/onboarding/step/2', data);

export const saveStep3Api = (data: Step3Payload) =>
  api.post<ApiResponse<{ profile: UserProfile; nextStep: number }>>('/profile/onboarding/step/3', data);

export const saveStep4Api = (data: Step4Payload) =>
  api.post<ApiResponse<{ profile: UserProfile; nextStep: number }>>('/profile/onboarding/step/4', data);

export const saveStep5Api = (data: Step5Payload) =>
  api.post<ApiResponse<{ profile: UserProfile; isCompleted: boolean }>>('/profile/onboarding/step/5', data);