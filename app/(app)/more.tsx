import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { getSyncStatusApi } from '@/lib/api/tariff.api';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

function MenuItem({ icon, label, sub, onPress, danger, isDark, badge }: {
  icon: React.ReactNode; label: string; sub?: string;
  onPress: () => void; danger?: boolean; isDark: boolean; badge?: string;
}) {
  const textColor = danger ? '#E24B4A' : (isDark ? '#F0F8FF' : '#0D2C40');
  const subColor  = isDark ? '#7AAEC8' : '#4A6A82';

  return (
    <Pressable onPress={onPress}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 14,
        paddingVertical: 14, paddingHorizontal: 16,
      }}>
        <View style={{
          width: 38, height: 38, borderRadius: 10,
          backgroundColor: danger ? '#E24B4A15' : (isDark ? '#1E3A52' : '#F0F6FB'),
          alignItems: 'center', justifyContent: 'center',
        }}>{icon}</View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: textColor, fontSize: 14, fontFamily: 'Poppins' }}>{label}</Text>
          {sub && <Text style={{ color: subColor, fontSize: 12, fontFamily: 'Poppins',
            marginTop: 1 }}>{sub}</Text>}
        </View>
        {badge && (
          <View style={{ backgroundColor: '#2272A620', borderRadius: 8,
            paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#2272A6', fontSize: 11, fontFamily: 'Poppins' }}>{badge}</Text>
          </View>
        )}
        {!badge && (
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={isDark ? '#4A6A82' : '#8BA8C4'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{
      color: isDark ? '#4A6A82' : '#8BA8C4',
      fontSize: 11, fontFamily: 'Poppins', letterSpacing: 1,
      paddingHorizontal: 16, paddingTop: 20, paddingBottom: 6,
    }}>{title}</Text>
  );
}

export default function MoreScreen() {
  const { user, logout } = useAuthStore();
  const { profile }      = useProfileStore();
  const { colorScheme }  = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [syncStatus, setSyncStatus] = React.useState<any>(null);

  React.useEffect(() => {
    getSyncStatusApi()
      .then(r => setSyncStatus(r.data.data))
      .catch(() => {});
  }, []);

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
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ backgroundColor: '#0D2C40', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#F0F8FF', fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
          More
        </Text>
        <Text style={{ color: '#7AAEC8', fontSize: 13, fontFamily: 'Poppins', marginTop: 4 }}>
          Settings & account
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={{ padding: 16 }}>
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: borderC,
            flexDirection: 'row', alignItems: 'center', gap: 14,
          }}>
            <View style={{
              width: 52, height: 52, borderRadius: 26,
              backgroundColor: '#2272A620', borderWidth: 2, borderColor: '#2272A640',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text style={{ color: '#2272A6', fontSize: 20, fontWeight: '700',
                fontFamily: 'Poppins-Bold' }}>
                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: textFg, fontSize: 16, fontWeight: '600',
                fontFamily: 'Poppins-SemiBold' }}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>
                {user?.email}
              </Text>
              {profile?.companyName && (
                <Text style={{ color: '#2272A6', fontSize: 12, fontFamily: 'Poppins', marginTop: 2 }}>
                  {profile.companyName}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Tariff data section */}
        <SectionHeader title="TARIFF DATA" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginHorizontal: 16,
          borderWidth: 1, borderColor: borderC, overflow: 'hidden' }}>
          <MenuItem isDark={isDark} label="Sync Status"
            sub={syncStatus
              ? `${syncStatus.tariffCounts.total} tariffs — ${syncStatus.tariffCounts.live} live`
              : 'Loading…'}
            badge={syncStatus?.isSyncing ? 'Syncing' : undefined}
            onPress={() => {}}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
          {syncStatus && (
            <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ backgroundColor: '#2272A615', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: '#2272A6', fontSize: 11, fontFamily: 'Poppins' }}>
                    🔴 Live: {syncStatus.tariffCounts.live}
                  </Text>
                </View>
                <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 8,
                  paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
                    Cap-based: {syncStatus.tariffCounts.capBased}
                  </Text>
                </View>
              </View>
              {syncStatus.lastSyncedAt && (
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins', marginTop: 8 }}>
                  Last synced: {new Date(syncStatus.lastSyncedAt).toLocaleString('en-GB')}
                </Text>
              )}
              {syncStatus.currentOfgemCap && (
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins', marginTop: 4 }}>
                  Ofgem cap: {syncStatus.currentOfgemCap.quarter} {syncStatus.currentOfgemCap.year}
                  {' '}— Elec {syncStatus.currentOfgemCap.electricity.unitRate}p/kWh
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Account section */}
        <SectionHeader title="ACCOUNT" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginHorizontal: 16,
          borderWidth: 1, borderColor: borderC, overflow: 'hidden' }}>
          <MenuItem isDark={isDark} label="Edit Profile"
            sub="Update your business details"
            onPress={() => router.push('/(profile-setup)/step-1')}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <Circle cx="12" cy="7" r="4" stroke="#2272A6" strokeWidth="2" />
              </Svg>
            }
          />
          <View style={{ height: 1, backgroundColor: borderC, marginLeft: 68 }} />
          <MenuItem isDark={isDark} label="Energy Details"
            sub="Update your MPAN, MPRN and usage"
            onPress={() => router.push('/(profile-setup)/step-4')}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
                  stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>

        {/* Coming soon section */}
        <SectionHeader title="COMING SOON" isDark={isDark} />
        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginHorizontal: 16,
          borderWidth: 1, borderColor: borderC, overflow: 'hidden' }}>
          {[
            { label: 'Switch Tracker', sub: 'Track progress of energy switches', icon: '🔄' },
            { label: 'Document Vault', sub: 'LOAs, contracts & signed quotes', icon: '🗂️' },
            { label: 'Smart Meter', sub: 'Readings & consumption data', icon: '📡' },
            { label: 'Payments', sub: 'Commission & GoCardless integration', icon: '💳' },
            { label: 'Notifications', sub: 'Contract renewals & alerts', icon: '🔔' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14,
                paddingVertical: 13, paddingHorizontal: 16, opacity: 0.6 }}>
                <View style={{
                  width: 38, height: 38, borderRadius: 10,
                  backgroundColor: isDark ? '#1E3A52' : '#F0F6FB',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: textFg, fontSize: 14, fontFamily: 'Poppins' }}>{item.label}</Text>
                  <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins', marginTop: 1 }}>{item.sub}</Text>
                </View>
                <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 8,
                  paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Soon</Text>
                </View>
              </View>
              {i < arr.length - 1 && (
                <View style={{ height: 1, backgroundColor: borderC, marginLeft: 68 }} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* Sign out */}
        <View style={{ backgroundColor: cardBg, borderRadius: 16, marginHorizontal: 16,
          marginTop: 16, borderWidth: 1, borderColor: borderC, overflow: 'hidden' }}>
          <MenuItem isDark={isDark} label="Sign Out" danger
            sub="Log out of your account"
            onPress={handleLogout}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>

        {/* App version */}
        <View style={{ alignItems: 'center', paddingVertical: 24 }}>
          <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
            Energy Broker v1.0.0 · Built with ⚡
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
