import { useAuthStore } from '@/lib/store/auth.store';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }} />
  );
}