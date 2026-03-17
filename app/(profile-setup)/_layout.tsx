import { useAuthStore } from '@/lib/store/auth.store';
import { Redirect, Stack } from 'expo-router';

export default function ProfileSetupLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: false, // prevent swipe-back mid-onboarding
      }}
    />
  );
}