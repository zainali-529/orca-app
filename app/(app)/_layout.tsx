import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { Redirect, Stack } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { onboardingStatus, loadOnboardingStatus } = useProfileStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      loadOnboardingStatus();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  // Still loading onboarding status
  if (onboardingStatus === null) {
    return (
      <View style={{
        flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#0E1923',
      }}>
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  // ── Profile onboarding not complete ────────────────────────
  // ALWAYS redirect to step-1 — never jump mid-stack.
  // Step-1 loads previous selection from profile store,
  // user taps Continue and naturally builds the nav stack.
  // This prevents GO_BACK crash on cold start.
  if (!onboardingStatus.isCompleted) {
    return <Redirect href="/(profile-setup)/step-1" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }} />
  );
}
