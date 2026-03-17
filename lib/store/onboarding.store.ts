import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

const ONBOARDING_KEY = 'onboarding_completed';

interface OnboardingState {
  hasSeenOnboarding: boolean | null; // null = not yet checked
  checkOnboarding: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
  hasSeenOnboarding: null,

  checkOnboarding: async () => {
    const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
    // set({ hasSeenOnboarding: null ?? false });
    set({ hasSeenOnboarding: val === 'true' });
  },

  completeOnboarding: async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    set({ hasSeenOnboarding: true });
  },
}));