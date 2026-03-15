import { useAuthStore } from '@/lib/store/auth.store';
import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { Redirect } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const { hasSeenOnboarding, checkOnboarding } = useOnboardingStore();

  React.useEffect(() => {
    checkOnboarding();
  }, [checkOnboarding]);

  if (!isInitialized || hasSeenOnboarding === null) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!hasSeenOnboarding) return <Redirect href="/onboarding" />;

  return isAuthenticated
    ? <Redirect href="/(app)" />
    : <Redirect href="/(auth)/login" />;
}