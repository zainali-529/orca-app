import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

function StatCard({ label, value, sub, color, isDark }: {
  label: string; value: string; sub?: string; color: string; isDark: boolean;
}) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: isDark ? '#132030' : '#FFFFFF',
      borderRadius: 14, padding: 16,
      borderWidth: 1, borderColor: isDark ? '#1E3A52' : '#E5EDF3',
    }}>
      <Text style={{ color: isDark ? '#7AAEC8' : '#4A6A82', fontSize: 11,
        fontFamily: 'Poppins', letterSpacing: 0.3, marginBottom: 6 }}>{label}</Text>
      <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 22,
        fontWeight: '700', fontFamily: 'Poppins-Bold' }}>{value}</Text>
      {sub && <Text style={{ color, fontSize: 11, fontFamily: 'Poppins', marginTop: 3 }}>{sub}</Text>}
    </View>
  );
}

function QuickAction({ icon, label, onPress, isDark }: {
  icon: React.ReactNode; label: string; onPress: () => void; isDark: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <View style={{
        backgroundColor: isDark ? '#132030' : '#FFFFFF',
        borderRadius: 14, padding: 16,
        alignItems: 'center', gap: 10,
        borderWidth: 1, borderColor: isDark ? '#1E3A52' : '#E5EDF3',
      }}>
        <View style={{
          width: 44, height: 44, borderRadius: 12,
          backgroundColor: '#2272A615',
          alignItems: 'center', justifyContent: 'center',
        }}>{icon}</View>
        <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 12,
          fontFamily: 'Poppins', textAlign: 'center' }}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function DashboardScreen() {
  const { user, logout } = useAuthStore();
  const { profile }      = useProfileStore();
  const { colorScheme }  = useColorScheme();
  const isDark = colorScheme === 'dark';

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout(); router.replace('/(auth)/login');
      }},
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={{
        backgroundColor: '#0D2C40',
        paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: '#7AAEC8', fontSize: 13, fontFamily: 'Poppins' }}>
              Good day,
            </Text>
            <Text style={{ color: '#F0F8FF', fontSize: 22, fontWeight: '700',
              fontFamily: 'Poppins-Bold', marginTop: 2 }}>
              {user?.firstName} {user?.lastName}
            </Text>
            {profile?.companyName && (
              <Text style={{ color: '#7AAEC8', fontSize: 12, fontFamily: 'Poppins', marginTop: 2 }}>
                {profile.companyName}
              </Text>
            )}
          </View>
          <Pressable onPress={handleLogout} hitSlop={12}
            style={{ padding: 8, borderRadius: 10, backgroundColor: '#2272A615',
              borderWidth: 1, borderColor: '#2272A630' }}>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                stroke="#7AAEC8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <View style={{ padding: 20, gap: 16 }}>

        {/* ── Stats row ── */}
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard label="CUSTOMERS" value="0"
            sub="No clients yet" color="#2272A6" isDark={isDark} />
          <StatCard label="ACTIVE SWITCHES" value="0"
            sub="None in progress" color="#7AAEC8" isDark={isDark} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatCard label="QUOTES SENT" value="0"
            sub="Generate your first" color="#3D9DD4" isDark={isDark} />
          <StatCard label="COMMISSION" value="£0"
            sub="This month" color="#2DD4A0" isDark={isDark} />
        </View>

        {/* ── Quick actions ── */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: borderC,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold', marginBottom: 14 }}>Quick Actions</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <QuickAction isDark={isDark} label="Compare Tariffs"
              onPress={() => router.push('/(app)/tariffs/index')}
              icon={
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#2272A6"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              }
            />
            <QuickAction isDark={isDark} label="New Quote"
              onPress={() => router.push('/(app)/quotes')}
              icon={
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
                    stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M12 18v-6M9 15h6" stroke="#2272A6"
                    strokeWidth="2" strokeLinecap="round" />
                </Svg>
              }
            />
            <QuickAction isDark={isDark} label="Add Client"
              onPress={() => router.push('/(app)/clients')}
              icon={
                <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <Path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"
                    stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <Circle cx="9" cy="7" r="4" stroke="#2272A6" strokeWidth="2" />
                  <Path d="M19 8v6M22 11h-6" stroke="#2272A6" strokeWidth="2" strokeLinecap="round" />
                </Svg>
              }
            />
          </View>
        </View>

        {/* ── Profile summary ── */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: borderC,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold', marginBottom: 12 }}>Your Energy Profile</Text>
          <View style={{ gap: 8 }}>
            {[
              { label: 'Business type', value: profile?.businessType ?? 'Not set' },
              { label: 'Electricity MPAN', value: profile?.energy?.mpan ?? 'Not set' },
              { label: 'Gas MPRN', value: profile?.energy?.mprn ?? 'Not set' },
              { label: 'Current supplier', value: profile?.energy?.currentElectricitySupplier ?? 'Not set' },
            ].map((row) => (
              <View key={row.label} style={{ flexDirection: 'row', justifyContent: 'space-between',
                paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: borderC }}>
                <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>{row.label}</Text>
                <Text style={{ color: textFg, fontSize: 13, fontFamily: 'Poppins',
                  textTransform: 'capitalize' }}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Coming soon ── */}
        <View style={{
          backgroundColor: '#2272A610', borderRadius: 16, padding: 16,
          borderWidth: 1, borderColor: '#2272A625',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <Circle cx="12" cy="12" r="10" stroke="#2272A6" strokeWidth="2" />
              <Path d="M12 8v4M12 16h.01" stroke="#2272A6" strokeWidth="2" strokeLinecap="round" />
            </Svg>
            <Text style={{ color: '#2272A6', fontSize: 13, fontWeight: '600',
              fontFamily: 'Poppins-SemiBold' }}>Coming Soon</Text>
          </View>
          {['Switch Tracker', 'Document Vault', 'Smart Meter Readings', 'Payments & Commission'].map((item) => (
            <View key={item} style={{ flexDirection: 'row', alignItems: 'center',
              gap: 8, paddingVertical: 5 }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#2272A6' }} />
              <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>{item}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
