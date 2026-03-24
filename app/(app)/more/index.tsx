import { Text }                from '@/components/ui/text';
import { useAuthStore }         from '@/lib/store/auth.store';
import { useProfileStore }      from '@/lib/store/profile.store';
import { useSwitchStore }       from '@/lib/store/switch.store';
import { useConsultationStore } from '@/lib/store/consultation.store';
import { useMeterReadingStore } from '@/lib/store/meter.store';
import { getSyncStatusApi }     from '@/lib/api/tariff.api';
import { router }               from 'expo-router';
import { useColorScheme }       from 'nativewind';
import * as React               from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Sun, Moon, Laptop } from 'lucide-react-native';

// ─── MenuItem ─────────────────────────────────────────────────────

function MenuItem({ icon, label, sub, onPress, danger, badge, badgeColor = 'orange' }: {
  icon:        React.ReactNode;
  label:       string;
  sub?:        string;
  onPress:     () => void;
  danger?:     boolean;
  badge?:      string;
  badgeColor?: 'orange' | 'blue' | 'teal' | 'green';
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const badgeStyles = {
    orange: 'bg-orange-500/15 border-orange-500/25',
    blue:   'bg-primary/13 border-primary/25',
    teal:   'bg-brand-teal/10 border-brand-teal/25',
    green:  'bg-brand-green/10 border-brand-green/25',
  };
  const badgeTextStyles = {
    orange: 'text-orange-400',
    blue:   'text-brand-blue-bright',
    teal:   'text-brand-teal',
    green:  'text-brand-green',
  };

  return (
    <Pressable onPress={onPress}>
      <View className="flex-row items-center gap-3.5 py-3.5 px-4">
        <View
          className={['items-center justify-center rounded-xl',
            danger ? 'bg-destructive/8' : 'bg-primary/6 dark:bg-border/20'].join(' ')}
          style={{ width: 38, height: 38 }}
        >
          {icon}
        </View>
        <View className="flex-1">
          <Text className={['text-sm font-sans',
            danger ? 'text-destructive' : 'text-brand dark:text-brand-fg'].join(' ')}>
            {label}
          </Text>
          {sub && (
            <Text className="text-xs font-sans mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">
              {sub}
            </Text>
          )}
        </View>
        {badge ? (
          <View className={`border rounded-lg px-2 py-1 ${badgeStyles[badgeColor]}`}>
            <Text className={`text-xs font-semibold ${badgeTextStyles[badgeColor]}`}>
              {badge}
            </Text>
          </View>
        ) : (
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6"
              stroke={isDark ? '#4A6A82' : '#8BA8C4'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        )}
      </View>
    </Pressable>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-sans tracking-widest px-4 pt-5 pb-1.5 text-[#8BA8C4] dark:text-[#4A6A82]">
      {title}
    </Text>
  );
}

function ThemeOption({ 
  label, 
  icon: Icon, 
  active, 
  onPress 
}: { 
  label: string; 
  icon: any; 
  active: boolean; 
  onPress: () => void;
}) {
  return (
    <Pressable 
      onPress={onPress}
      className={[
        'flex-1 flex-row items-center justify-center gap-2.5 py-3 rounded-xl border',
        active 
          ? 'bg-primary/10 border-primary' 
          : 'bg-card border-border'
      ].join(' ')}
    >
      <Icon size={18} color={active ? '#2272A6' : '#8BA8C4'} />
      <Text className={[
        'text-sm font-semibold',
        active ? 'text-primary' : 'text-brand dark:text-brand-fg'
      ].join(' ')}>
        {label}
      </Text>
    </Pressable>
  );
}

// Coming soon — just Payments + Notifications now
const COMING_SOON_ITEMS = [
  { label: 'Payments',      sub: 'Commission & GoCardless integration',  icon: '💳' },
  { label: 'Notifications', sub: 'Contract renewals & alerts',           icon: '🔔' },
];

// ─── Screen ───────────────────────────────────────────────────────

export default function MoreScreen() {
  const { user, logout }     = useAuthStore();
  const { profile }          = useProfileStore();
  const { summary, loadSwitches, loadSummary } = useSwitchStore();
  const { summary: consultSummary, loadSummary: loadConsultSummary } = useConsultationStore();
  const { summary: meterSummary, loadSummary: loadMeterSummary } = useMeterReadingStore();

  const { colorScheme, setColorScheme } = useColorScheme();
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark' | 'system'>('system');
  const isDark = colorScheme === 'dark';

  const [syncStatus, setSyncStatus] = React.useState<any>(null);

  React.useEffect(() => {
    getSyncStatusApi().then((r) => setSyncStatus(r.data.data)).catch(() => {});
    loadSwitches({ limit: 20 });
    loadSummary();
    loadConsultSummary();
    loadMeterSummary();
  }, []);

  const handleThemeChange = (mode: 'light' | 'dark' | 'system') => {
    setThemeMode(mode);
    setColorScheme(mode);
  };

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  // ── Switch badges ─────────────────────────────────────────────────
  const activeSwitches    = summary?.active ?? 0;
  const completedSwitches = summary?.completed ?? 0;
  const coolingOffCount   = summary?.cooling_off ?? 0;
  const objectedCount     = summary?.objected ?? 0;
  const switchBadge       = objectedCount > 0
    ? `${objectedCount} objection`
    : coolingOffCount > 0 ? `${coolingOffCount} cooling off`
    : activeSwitches > 0  ? `${activeSwitches} active`
    : undefined;
  const switchBadgeColor  = (objectedCount > 0 ? 'orange' : activeSwitches > 0 ? 'blue' : 'teal') as 'orange' | 'blue' | 'teal';
  const switchSub         = activeSwitches > 0
    ? `${activeSwitches} active switch${activeSwitches !== 1 ? 'es' : ''}${completedSwitches > 0 ? ` · ${completedSwitches} completed` : ''}`
    : completedSwitches > 0
    ? `${completedSwitches} completed switch${completedSwitches !== 1 ? 'es' : ''}`
    : 'Track your energy switches';

  // ── Meter reading badges ──────────────────────────────────────────
  const meterPending   = (meterSummary?.requested ?? 0) + (meterSummary?.processing ?? 0);
  const meterFulfilled = meterSummary?.fulfilled ?? 0;
  const hasMpan        = !!profile?.energy?.mpan;
  const hasMprn        = !!profile?.energy?.mprn;

  const meterBadge = meterPending > 0
    ? `${meterPending} pending`
    : meterFulfilled > 0
    ? `${meterFulfilled} readings`
    : (!hasMpan && !hasMprn ? 'Setup needed' : undefined);

  const meterBadgeColor = (
    meterPending > 0 ? 'orange' :
    meterFulfilled > 0 ? 'teal' :
    'blue'
  ) as 'orange' | 'teal' | 'blue';

  const meterSub = meterPending > 0
    ? `${meterPending} request${meterPending !== 1 ? 's' : ''} in progress`
    : meterFulfilled > 0
    ? `${meterFulfilled} reading${meterFulfilled !== 1 ? 's' : ''} available${
        meterSummary?.latestFulfilled?.electricity?.estimatedAnnualKwh
          ? ` · ~${Math.round(meterSummary.latestFulfilled.electricity.estimatedAnnualKwh / 100) * 100} kWh/yr`
          : ''
      }`
    : (!hasMpan && !hasMprn)
    ? 'Add MPAN/MPRN in Energy Details first'
    : 'Request your consumption data';

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-6 px-5">
        <Text className="text-xl font-bold text-brand-fg">More</Text>
        <Text className="text-sm font-sans mt-1 text-brand-fg-muted">
          Switches, meter data, documents & account
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Profile card ── */}
        <View className="p-4">
          <View className="bg-card rounded-2xl p-4 border border-border flex-row items-center gap-3.5">
            <View
              className="rounded-full bg-primary/13 border-2 border-primary/25 items-center justify-center"
              style={{ width: 52, height: 52 }}
            >
              <Text className="text-xl font-bold text-primary">
                {user?.firstName?.[0]?.toUpperCase()}{user?.lastName?.[0]?.toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-brand dark:text-brand-fg">
                {user?.firstName} {user?.lastName}
              </Text>
              <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {user?.email}
              </Text>
              {profile?.companyName && (
                <Text className="text-xs font-sans mt-0.5 text-primary">{profile.companyName}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── SWITCH TRACKER ── */}
        <SectionHeader title="SWITCH TRACKER" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="My Switches"
            sub={switchSub}
            badge={switchBadge}
            badgeColor={switchBadgeColor}
            onPress={() => router.push('/(app)/more/switches' as any)}
            icon={<Text style={{ fontSize: 18 }}>🔄</Text>}
          />
        </View>

        {/* ── SMART METER ── */}
        <SectionHeader title="SMART METER" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="My Meter Readings"
            sub={meterSub}
            badge={meterBadge}
            badgeColor={meterBadgeColor}
            onPress={() => router.push('/(app)/more/meter-readings' as any)}
            icon={<Text style={{ fontSize: 18 }}>📡</Text>}
          />
          <View className="h-px bg-border ml-[68px]" />
          <MenuItem
            label="Request Meter Data"
            sub="Get your consumption history from your supplier"
            onPress={() => router.push('/(app)/more/meter-readings/request' as any)}
            icon={<Text style={{ fontSize: 18 }}>📊</Text>}
          />
        </View>

        {/* ── CONSULTATIONS ── */}
        <SectionHeader title="CONSULTATIONS" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="My Consultations"
            sub={
              (consultSummary?.awaiting_payment ?? 0) > 0
                ? `${consultSummary!.awaiting_payment} payment pending`
                : (consultSummary?.upcoming ?? 0) > 0
                ? `${consultSummary!.upcoming} upcoming session${consultSummary!.upcoming !== 1 ? 's' : ''}`
                : (consultSummary?.active ?? 0) > 0
                ? `${consultSummary!.active} active`
                : 'Expert 1-on-1 energy sessions'
            }
            badge={
              (consultSummary?.awaiting_payment ?? 0) > 0
                ? `${consultSummary!.awaiting_payment} pay now`
                : (consultSummary?.upcoming ?? 0) > 0
                ? `${consultSummary!.upcoming} upcoming`
                : undefined
            }
            badgeColor={
              (consultSummary?.awaiting_payment ?? 0) > 0 ? 'orange' :
              (consultSummary?.upcoming ?? 0) > 0 ? 'blue' : 'teal'
            }
            onPress={() => router.push('/(app)/more/consultations' as any)}
            icon={<Text style={{ fontSize: 18 }}>💡</Text>}
          />
          <View className="h-px bg-border ml-[68px]" />
          <MenuItem
            label="Book a Consultation"
            sub="Tariff review, switch advice, energy audit &amp; more"
            onPress={() => router.push('/(app)/more/consultations/book' as any)}
            icon={<Text style={{ fontSize: 18 }}>📅</Text>}
          />
        </View>

        {/* ── TARIFF DATA ── */}
        <SectionHeader title="TARIFF DATA" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="Sync Status"
            sub={syncStatus
              ? `${syncStatus.tariffCounts.total} tariffs — ${syncStatus.tariffCounts.live} live`
              : 'Loading…'}
            badge={syncStatus?.isSyncing ? 'Syncing' : undefined}
            onPress={() => {}}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </Svg>
            }
          />
          {syncStatus && (
            <View className="px-4 pb-3.5">
              <View className="flex-row gap-2 flex-wrap">
                <View className="bg-primary/8 rounded-lg px-2.5 py-1">
                  <Text className="text-xs font-sans text-primary">🔴 Live: {syncStatus.tariffCounts.live}</Text>
                </View>
                <View className="bg-primary/6 dark:bg-brand rounded-lg px-2.5 py-1">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                    Cap-based: {syncStatus.tariffCounts.capBased}
                  </Text>
                </View>
              </View>
              {syncStatus.lastSyncedAt && (
                <Text className="text-xs font-sans mt-2 text-[#4A6A82] dark:text-brand-fg-muted">
                  Last synced: {new Date(syncStatus.lastSyncedAt).toLocaleString('en-GB')}
                </Text>
              )}
              {syncStatus.currentOfgemCap && (
                <Text className="text-xs font-sans mt-1 text-[#4A6A82] dark:text-brand-fg-muted">
                  Ofgem cap: {syncStatus.currentOfgemCap.quarter} {syncStatus.currentOfgemCap.year}
                  {' '}— Elec {syncStatus.currentOfgemCap.electricity.unitRate}p/kWh
                </Text>
              )}
            </View>
          )}
        </View>

        {/* ── ACCOUNT ── */}
        <SectionHeader title="ACCOUNT" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="Edit Profile"
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
          <View className="h-px bg-border ml-[68px]" />
          <MenuItem
            label="Energy Details"
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

        {/* ── THEME ── */}
        <SectionHeader title="THEME" />
        <View className="flex-row gap-2.5 mx-4">
          <ThemeOption 
            label="Light" 
            icon={Sun} 
            active={themeMode === 'light'} 
            onPress={() => handleThemeChange('light')} 
          />
          <ThemeOption 
            label="Dark" 
            icon={Moon} 
            active={themeMode === 'dark'} 
            onPress={() => handleThemeChange('dark')} 
          />
          <ThemeOption 
            label="System" 
            icon={Laptop} 
            active={themeMode === 'system'} 
            onPress={() => handleThemeChange('system')} 
          />
        </View>

        {/* ── COMING SOON ── */}
        <SectionHeader title="COMING SOON" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          {COMING_SOON_ITEMS.map((item, i) => (
            <React.Fragment key={item.label}>
              <View className="flex-row items-center gap-3.5 py-3 px-4 opacity-60">
                <View className="bg-primary/6 dark:bg-brand rounded-xl items-center justify-center"
                  style={{ width: 38, height: 38 }}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-sans text-brand dark:text-brand-fg">{item.label}</Text>
                  <Text className="text-xs font-sans mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">{item.sub}</Text>
                </View>
                <View className="bg-primary/6 dark:bg-brand rounded-lg px-2 py-1">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Soon</Text>
                </View>
              </View>
              {i < COMING_SOON_ITEMS.length - 1 && <View className="h-px bg-border ml-[68px]" />}
            </React.Fragment>
          ))}
        </View>

        {/* ── SIGN OUT ── */}
        <View className="bg-card rounded-2xl mx-4 mt-4 border border-border overflow-hidden">
          <MenuItem
            label="Sign Out" sub="Log out of your account" danger onPress={handleLogout}
            icon={
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="#E24B4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            }
          />
        </View>

        <View className="items-center py-6">
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            Energy Broker v1.0.0 · Built with ⚡
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}