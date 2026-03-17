import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ── Tab icons ──────────────────────────────────────────────
function HomeIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 22V12h6v10" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function ZapIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function FileIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function UsersIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
function MenuIcon({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 6h16M4 12h16M4 18h16"
        stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { onboardingStatus, loadOnboardingStatus } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    if (isAuthenticated) loadOnboardingStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  if (onboardingStatus === null) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',
        backgroundColor: isDark ? '#0E1923' : '#F0F4F8' }}>
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!onboardingStatus.isCompleted) {
    return <Redirect href="/(profile-setup)/step-1" />;
  }

  const activeTint   = '#2272A6';
  const inactiveTint = isDark ? '#4A6A82' : '#8BA8C4';
  const tabBg        = isDark ? '#0D1F2E' : '#FFFFFF';
  const borderColor  = isDark ? '#1E3A52' : '#E2EAF0';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor:   activeTint,
        tabBarInactiveTintColor: inactiveTint,
        tabBarStyle: {
          backgroundColor: tabBg,
          borderTopWidth:  1,
          borderTopColor:  borderColor,
          height:          60,
          paddingBottom:   8,
          paddingTop:      6,
          elevation:       0,
          shadowOpacity:   0,
        },
        tabBarLabelStyle: {
          fontSize:    10,
          fontFamily:  'Poppins',
          fontWeight:  '600',
          marginTop:   2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <HomeIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="tariffs"
        options={{
          title: 'Tariffs',
          tabBarIcon: ({ color }) => <ZapIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="quotes"
        options={{
          title: 'Quotes',
          tabBarIcon: ({ color }) => <FileIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="clients"
        options={{
          title: 'Clients',
          tabBarIcon: ({ color }) => <UsersIcon color={color} size={22} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <MenuIcon color={color} size={22} />,
        }}
      />
    </Tabs>
  );
}
