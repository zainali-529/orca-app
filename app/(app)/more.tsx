import { Text }           from '@/components/ui/text';
import { useAuthStore }     from '@/lib/store/auth.store';
import { useProfileStore }  from '@/lib/store/profile.store';
import { useDocumentStore } from '@/lib/store/document.store';
import { useSwitchStore }   from '@/lib/store/switch.store';
import { useConsultationStore } from '@/lib/store/consultation.store';
import { getSyncStatusApi } from '@/lib/api/tariff.api';
import { router }           from 'expo-router';
import { useColorScheme }   from 'nativewind';
import * as React           from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── MenuItem ─────────────────────────────────────────────────────

function MenuItem({ icon, label, sub, onPress, danger, badge, badgeColor = 'orange' }: {
  icon:        React.ReactNode;
  label:       string;
  sub?:        string;
  onPress:     () => void;
  danger?:     boolean;
  badge?:      string;
  badgeColor?: 'orange' | 'blue' | 'teal';
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const badgeStyles = {
    orange: 'bg-orange-500/15 border-orange-500/25',
    blue:   'bg-primary/13 border-primary/25',
    teal:   'bg-brand-teal/10 border-brand-teal/25',
  };
  const badgeTextStyles = {
    orange: 'text-orange-400',
    blue:   'text-brand-blue-bright',
    teal:   'text-brand-teal',
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

// Coming soon — Smart Meter + Payments + Notifications remain here
const COMING_SOON_ITEMS = [
  { label: 'Smart Meter',     sub: 'Readings & consumption data',          icon: '📡' },
  { label: 'Payments',        sub: 'Commission & GoCardless integration',  icon: '💳' },
  { label: 'Notifications',   sub: 'Contract renewals & alerts',           icon: '🔔' },
];

// ─── Screen ───────────────────────────────────────────────────────

export default function MoreScreen() {
  const { user, logout }     = useAuthStore();
  const { profile }          = useProfileStore();
  const { documents, loadDocuments } = useDocumentStore();
  const { switches, summary, loadSwitches, loadSummary } = useSwitchStore();
  const { summary: consultSummary, loadSummary: loadConsultSummary } = useConsultationStore();

  const [syncStatus, setSyncStatus] = React.useState<any>(null);

  React.useEffect(() => {
    getSyncStatusApi().then((r) => setSyncStatus(r.data.data)).catch(() => {});
    loadDocuments({ limit: 50 });
    loadSwitches({ limit: 20 });
    loadSummary();
    loadConsultSummary();
  }, []);

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)/login');
      }},
    ]);
  };

  // Document badge
  const pendingDocs    = documents.filter((d) => d.status === 'pending_signature').length;
  const signedDocs     = documents.filter((d) => d.status === 'signed').length;
  const brokerSentDocs = documents.filter((d) => d.sentByAdmin && d.status === 'pending_signature').length;

  const docBadge      = brokerSentDocs > 0 ? `${brokerSentDocs} from broker` : pendingDocs > 0 ? `${pendingDocs} pending` : undefined;
  const docBadgeColor = (brokerSentDocs > 0 ? 'blue' : 'orange') as 'blue' | 'orange';
  const docSub = pendingDocs > 0
    ? `${pendingDocs} awaiting signature${brokerSentDocs > 0 ? ` (${brokerSentDocs} from broker)` : ''}`
    : signedDocs > 0 ? `${signedDocs} signed document${signedDocs !== 1 ? 's' : ''}`
    : 'Letters of Authority & contracts';

  // Switch badge
  const activeSwitches    = summary?.active ?? 0;
  const completedSwitches = summary?.completed ?? 0;
  const coolingOffCount   = summary?.cooling_off ?? 0;
  const objectedCount     = summary?.objected ?? 0;

  const switchBadge = objectedCount > 0
    ? `${objectedCount} objection`
    : coolingOffCount > 0
    ? `${coolingOffCount} cooling off`
    : activeSwitches > 0
    ? `${activeSwitches} active`
    : undefined;

  const switchBadgeColor = (objectedCount > 0 ? 'orange' : activeSwitches > 0 ? 'blue' : 'teal') as 'orange' | 'blue' | 'teal';

  const switchSub = activeSwitches > 0
    ? `${activeSwitches} active switch${activeSwitches !== 1 ? 'es' : ''}${completedSwitches > 0 ? ` · ${completedSwitches} completed` : ''}`
    : completedSwitches > 0
    ? `${completedSwitches} completed switch${completedSwitches !== 1 ? 'es' : ''}`
    : 'Track your energy switches';

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-6 px-5">
        <Text className="text-xl font-bold text-brand-fg">More</Text>
        <Text className="text-sm font-sans mt-1 text-brand-fg-muted">
          Switches, documents & account
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Profile card */}
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

        {/* ── SWITCH TRACKER — now a real section, no longer "Coming Soon" ── */}
        <SectionHeader title="SWITCH TRACKER" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="My Switches"
            sub={switchSub}
            badge={switchBadge}
            badgeColor={switchBadgeColor}
            onPress={() => router.push('/(app)/switches' as any)}
            icon={<Text style={{ fontSize: 18 }}>🔄</Text>}
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
            onPress={() => router.push('/(app)/consultations' as any)}
            icon={<Text style={{ fontSize: 18 }}>💡</Text>}
          />
          <View className="h-px bg-border ml-[68px]" />
          <MenuItem
            label="Book a Consultation"
            sub="Tariff review, switch advice, energy audit &amp; more"
            onPress={() => router.push('/(app)/consultations/book' as any)}
            icon={<Text style={{ fontSize: 18 }}>📅</Text>}
          />
        </View>

        {/* ── DOCUMENTS ── */}
        <SectionHeader title="DOCUMENTS" />
        <View className="bg-card rounded-2xl mx-4 border border-border overflow-hidden">
          <MenuItem
            label="My Documents"
            sub={docSub}
            badge={docBadge}
            badgeColor={docBadgeColor}
            onPress={() => router.push('/(app)/documents' as any)}
            icon={<Text style={{ fontSize: 18 }}>📋</Text>}
          />
          <View className="h-px bg-border ml-[68px]" />
          <MenuItem
            label="Sign Letter of Authority"
            sub="Authorise us to compare & switch on your behalf"
            onPress={() => router.push('/(app)/documents' as any)}
            icon={<Text style={{ fontSize: 18 }}>✍️</Text>}
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

        {/* ── COMING SOON (reduced — Switch Tracker moved out) ── */}
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