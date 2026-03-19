import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/lib/store/auth.store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from '@expo-google-fonts/poppins';

// Keep splash visible until fonts are loaded
SplashScreen.preventAutoHideAsync();

export { ErrorBoundary } from 'expo-router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 5 * 60 * 1000 },
  },
});

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const initialize = useAuthStore((s) => s.initialize);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    // Aliases so RN can find them by short name too
    'Poppins':        Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold':   Poppins_700Bold,
  });

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Make sure we resolve the actual theme before returning anything to keep hooks consistent
  const theme = NAV_THEME[colorScheme ?? 'light'];
  const statusBarStyle = colorScheme === 'dark' ? 'light' : 'dark';

  // Don't render until fonts are ready — prevents FOUT (flash of unstyled text)
  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={theme}>
        <StatusBar style={statusBarStyle} />
        <Stack screenOptions={{ headerShown: false }} />
        <PortalHost />
      </ThemeProvider>
    </QueryClientProvider>
  );
}