import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const { profile }      = useProfileStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout(); router.replace('/(auth)/login');
      }},
    ]);
  };

  return (
    <View className="flex-1 bg-background">
      {/* ── Header — always brand navy ──────────────────────────── */}
      <View className="bg-brand pt-14 pb-6 px-5">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-sm font-sans text-brand-fg-muted">
              Good day,
            </Text>
            <Text className="text-xl font-bold text-brand-fg mt-1">
              {user?.firstName} {user?.lastName}
            </Text>
            {profile?.companyName && (
              <Text className="text-xs font-sans text-brand-fg-muted mt-1">
                {profile.companyName}
              </Text>
            )}
          </View>
          <Pressable 
            onPress={handleLogout} 
            hitSlop={12}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20"
          >
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="#7AAEC8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* ── Empty state / Simple content ────────────────────────── */}
      <View className="flex-1 items-center justify-center p-10 gap-4">
        {/* Icon box */}
        <View className="w-20 h-20 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20">
          <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M9 22V12h6v10" 
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>

        <Text className="text-lg font-bold text-brand dark:text-brand-fg text-center">
          Dashboard
        </Text>

        <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
          Welcome to your Orca dashboard. Analytics, recent activity, and quick actions will appear here soon.
        </Text>
      </View>
    </View>
  );
}
