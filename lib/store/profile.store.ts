import { create } from 'zustand';
import {
  getProfileApi,
  getOnboardingStatusApi,
  saveStep1Api,
  saveStep2Api,
  saveStep3Api,
  saveStep4Api,
  saveStep5Api,
} from '@/lib/api/profile.api';
import type {
  OnboardingStatus,
  Step1Payload,
  Step2Payload,
  Step3Payload,
  Step4Payload,
  Step5Payload,
  UserProfile,
} from '@/lib/types/profile.types';

interface ProfileState {
  profile:           UserProfile | null;
  onboardingStatus:  OnboardingStatus | null;
  isLoading:         boolean;
  isInitialized:     boolean;

  // Actions
  loadProfile:           () => Promise<void>;
  loadOnboardingStatus:  () => Promise<void>;
  saveStep1:             (data: Step1Payload) => Promise<number>;
  saveStep2:             (data: Step2Payload) => Promise<number>;
  saveStep3:             (data: Step3Payload) => Promise<number>;
  saveStep4:             (data: Step4Payload) => Promise<number>;
  saveStep5:             (data: Step5Payload) => Promise<boolean>;
  reset:                 () => void;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile:          null,
  onboardingStatus: null,
  isLoading:        false,
  isInitialized:    false,

  loadProfile: async () => {
    set({ isLoading: true });
    try {
      const res = await getProfileApi();
      set({ profile: res.data.data.profile, isInitialized: true });
    } catch {
      set({ isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },

  loadOnboardingStatus: async () => {
    try {
      const res = await getOnboardingStatusApi();
      set({ onboardingStatus: res.data.data });
    } catch {}
  },

  saveStep1: async (data) => {
    set({ isLoading: true });
    try {
      const res = await saveStep1Api(data);
      set({ profile: res.data.data.profile });
      await get().loadOnboardingStatus();
      return res.data.data.nextStep;
    } finally {
      set({ isLoading: false });
    }
  },

  saveStep2: async (data) => {
    set({ isLoading: true });
    try {
      const res = await saveStep2Api(data);
      set({ profile: res.data.data.profile });
      await get().loadOnboardingStatus();
      return res.data.data.nextStep;
    } finally {
      set({ isLoading: false });
    }
  },

  saveStep3: async (data) => {
    set({ isLoading: true });
    try {
      const res = await saveStep3Api(data);
      set({ profile: res.data.data.profile });
      await get().loadOnboardingStatus();
      return res.data.data.nextStep;
    } finally {
      set({ isLoading: false });
    }
  },

  saveStep4: async (data) => {
    set({ isLoading: true });
    try {
      const res = await saveStep4Api(data);
      set({ profile: res.data.data.profile });
      await get().loadOnboardingStatus();
      return res.data.data.nextStep;
    } finally {
      set({ isLoading: false });
    }
  },

  saveStep5: async (data) => {
    set({ isLoading: true });
    try {
      const res = await saveStep5Api(data);
      set({ profile: res.data.data.profile });
      await get().loadOnboardingStatus();
      return res.data.data.isCompleted;
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ profile: null, onboardingStatus: null, isInitialized: false }),
}));