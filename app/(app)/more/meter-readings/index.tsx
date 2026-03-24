import { Text } from '@/components/ui/text';
import { useMeterReadingStore } from '@/lib/store/meter.store';
import { useProfileStore } from '@/lib/store/profile.store';
import type { MeterFuelType, MeterReading, MeterReadingStatus } from '@/lib/types/meter.types';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CFG: Record<MeterReadingStatus, {
  label:     string;
  emoji:     string;
  bgClass:   string;
  textClass: string;
  desc:      string;
}> = {
  requested:  {
    label: 'Requested',   emoji: '📡',
    bgClass: 'bg-primary/13', textClass: 'text-primary',
    desc: 'Your request has been received. Our team will retrieve your data.',
  },
  processing: {
    label: 'Processing',  emoji: '⚙️',
    bgClass: 'bg-orange-500/10', textClass: 'text-orange-400',
    desc: 'Our team is pulling your meter data. This usually takes a few hours.',
  },
  fulfilled:  {
    label: 'Fulfilled',   emoji: '✅',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal',
    desc: 'Your consumption data is ready to view.',
  },
  failed:     {
    label: 'Failed',      emoji: '❌',
    bgClass: 'bg-destructive/8', textClass: 'text-destructive',
    desc: 'We were unable to retrieve data. Please contact your broker.',
  },
};

const FUEL_LABELS: Record<string, { label: string; icon: string }> = {
  electricity: { label: 'Electricity', icon: '⚡' },
  gas:         { label: 'Gas',         icon: '🔥' },
  both:        { label: 'Dual Fuel',   icon: '⚡🔥' },
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  current_usage:   'Current Usage',
  historical:      'Historical',
  annual_estimate: 'Annual Estimate',
};

const FILTER_TABS: { id: MeterReadingStatus | 'all'; label: string }[] = [
  { id: 'all',        label: 'All'       },
  { id: 'requested',  label: 'Pending'   },
  { id: 'processing', label: 'Processing'},
  { id: 'fulfilled',  label: 'Done'      },
  { id: 'failed',     label: 'Failed'    },
];

// ─── Stat pill ─────────────────────────────────────────────────────

function StatPill({
  value, label, colorClass, borderClass,
}: { value: number; label: string; colorClass: string; borderClass: string }) {
  return (
    <View className={`items-center px-3 py-2 rounded-xl border ${colorClass} ${borderClass}`}>
      <Text className="text-base font-bold text-brand-fg">{value}</Text>
      <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">{label}</Text>
    </View>
  );
}

// ─── Reading card ──────────────────────────────────────────────────

function ReadingCard({ item }: { item: MeterReading }) {
  const cfg     = STATUS_CFG[item.status];
  const fuel    = FUEL_LABELS[item.fuelType] ?? { label: item.fuelType, icon: '📊' };
  const reqType = REQUEST_TYPE_LABELS[item.requestType] ?? item.requestType;
  const date    = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const isFulfilled = item.status === 'fulfilled';
  const isPending   = item.status === 'requested' || item.status === 'processing';
  const isFailed    = item.status === 'failed';

  // Show consumption numbers if fulfilled
  const elecKwh = item.electricity?.estimatedAnnualKwh;
  const gasKwh  = item.gas?.estimatedAnnualKwh;
  const annualCost = item.electricity?.estimatedAnnualCost || item.gas?.estimatedAnnualCost;

  return (
    <Pressable onPress={() => router.push(`/(app)/more/meter-readings/${item._id}` as any)}>
      <View className={[
        'bg-card rounded-card p-4 mb-2.5 border',
        isFulfilled ? 'border-brand-teal/25' :
        isPending   ? 'border-primary/20'    :
        isFailed    ? 'border-destructive/25' :
        'border-border',
      ].join(' ')}>

        {/* ── Top row ── */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-1.5 flex-1 flex-wrap mr-2">
            <View className={`px-2 py-0.5 rounded-full ${cfg.bgClass}`}>
              <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                {cfg.emoji} {cfg.label}
              </Text>
            </View>
            <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-1.5 py-0.5">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {fuel.icon} {fuel.label}
              </Text>
            </View>
            <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-1.5 py-0.5">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {reqType}
              </Text>
            </View>
          </View>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-shrink-0">
            {date}
          </Text>
        </View>

        {/* ── Reference ── */}
        <Text className="text-xs font-bold text-primary mb-1.5">{item.readingNumber}</Text>

        {/* ── Meter IDs ── */}
        <View className="flex-row gap-2 mb-2.5">
          {item.mpan && (
            <View className="bg-primary/6 dark:bg-brand rounded-lg px-2.5 py-1 flex-row items-center gap-1">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                ⚡ MPAN: {item.mpan}
              </Text>
            </View>
          )}
          {item.mprn && (
            <View className="bg-primary/6 dark:bg-brand rounded-lg px-2.5 py-1 flex-row items-center gap-1">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                🔥 MPRN: {item.mprn}
              </Text>
            </View>
          )}
        </View>

        {/* ── Fulfilled data preview ── */}
        {isFulfilled && (elecKwh || gasKwh) && (
          <View className="bg-brand-teal/8 rounded-xl p-3 border border-brand-teal/20">
            <View className="flex-row justify-between items-center flex-wrap gap-2">
              {elecKwh && (
                <View className="items-center">
                  <Text className="text-xs font-sans text-brand-teal mb-0.5">Est. Annual Elec</Text>
                  <Text className="text-base font-bold text-brand-teal">
                    {Math.round(elecKwh).toLocaleString()} kWh
                  </Text>
                </View>
              )}
              {gasKwh && (
                <View className="items-center">
                  <Text className="text-xs font-sans text-brand-teal mb-0.5">Est. Annual Gas</Text>
                  <Text className="text-base font-bold text-brand-teal">
                    {Math.round(gasKwh).toLocaleString()} kWh
                  </Text>
                </View>
              )}
              {annualCost && (
                <View className="items-center">
                  <Text className="text-xs font-sans text-brand-teal mb-0.5">Est. Annual Cost</Text>
                  <Text className="text-base font-bold text-brand-teal">
                    £{Math.round(annualCost).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Processing hint ── */}
        {item.status === 'processing' && (
          <View className="bg-orange-500/10 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-orange-400">
              ⚙️ Our team is retrieving your data…
            </Text>
          </View>
        )}

        {/* ── Failed reason ── */}
        {isFailed && item.failureReason && (
          <View className="bg-destructive/8 rounded-lg px-2.5 py-1.5">
            <Text className="text-xs font-sans text-destructive" numberOfLines={2}>
              {item.failureReason}
            </Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Empty state ───────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20 mb-4">
        <Text style={{ fontSize: 30 }}>📡</Text>
      </View>
      <Text className="text-base font-bold text-brand dark:text-brand-fg text-center mb-1.5">
        {filter === 'all' ? 'No meter readings yet' : `No ${filter} readings`}
      </Text>
      <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted mb-5">
        {filter === 'all'
          ? 'Request your smart meter data and our team will retrieve your consumption history.'
          : `You have no ${filter} meter reading requests.`}
      </Text>
      <Pressable
        onPress={() => router.push('/(app)/more/meter-readings/request' as any)}
        className="bg-primary rounded-card px-6 py-3"
      >
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
          Request Meter Data
        </Text>
      </Pressable>
    </View>
  );
}

// ─── FAB ──────────────────────────────────────────────────────────

function FAB() {
  const scale = useSharedValue(1);
  const s     = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={s} className="absolute bottom-6 right-5">
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.92, { damping: 12 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
          router.push('/(app)/more/meter-readings/request' as any);
        }}
        className="flex-row items-center gap-2 bg-primary rounded-full px-5 py-3.5"
        style={{
          shadowColor: '#2272A6', shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
        }}
      >
        <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
        </Svg>
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
          Request Data
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function MeterReadingsIndexScreen() {
  const { readings, pagination, summary, isLoadingList, loadReadings, loadSummary } =
    useMeterReadingStore();
  const { profile } = useProfileStore();

  const [activeFilter, setActiveFilter] = React.useState<MeterReadingStatus | 'all'>('all');
  const [refreshing,   setRefreshing]   = React.useState(false);

  const fetch = React.useCallback(
    (f: MeterReadingStatus | 'all' = activeFilter) =>
      loadReadings(f === 'all' ? { limit: 30 } : { status: f, limit: 30 }),
    [activeFilter]
  );

  React.useEffect(() => {
    fetch();
    loadSummary();
  }, []);

  const handleFilter = (f: MeterReadingStatus | 'all') => {
    setActiveFilter(f);
    loadReadings(f === 'all' ? { limit: 30 } : { status: f, limit: 30 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetch(), loadSummary()]);
    setRefreshing(false);
  };

  const hasMpan = !!profile?.energy?.mpan;
  const hasMprn = !!profile?.energy?.mprn;
  const hasMeters = hasMpan || hasMprn;

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-4 px-5">

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-brand-fg">Smart Meter Data</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {pagination
                ? `${pagination.total} request${pagination.total !== 1 ? 's' : ''}`
                : 'Your consumption history'}
            </Text>
          </View>
          {/* Meter IDs badge */}
          {hasMeters && (
            <View className="items-end gap-1">
              {hasMpan && (
                <View className="bg-primary/15 border border-primary/25 rounded-lg px-2 py-0.5">
                  <Text className="text-xs font-bold text-brand-fg">⚡ MPAN set</Text>
                </View>
              )}
              {hasMprn && (
                <View className="bg-primary/15 border border-primary/25 rounded-lg px-2 py-0.5">
                  <Text className="text-xs font-bold text-brand-fg">🔥 MPRN set</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Stats row */}
        {summary && summary.total > 0 && (
          <View className="flex-row gap-2 mb-3 flex-wrap">
            {summary.fulfilled > 0 && (
              <StatPill value={summary.fulfilled} label="Fulfilled"
                colorClass="bg-brand-teal/10" borderClass="border-brand-teal/20" />
            )}
            {summary.active > 0 && (
              <StatPill value={summary.active} label="Pending"
                colorClass="bg-primary/15" borderClass="border-primary/25" />
            )}
            {summary.failed > 0 && (
              <StatPill value={summary.failed} label="Failed"
                colorClass="bg-destructive/10" borderClass="border-destructive/20" />
            )}
          </View>
        )}

        {/* Latest data card */}
        {summary?.latestFulfilled && (
          <Pressable
            onPress={() => router.push(`/(app)/more/meter-readings/${summary.latestFulfilled!._id}` as any)}
            className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl p-3 mb-3 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 16 }}>📊</Text>
              <View>
                <Text className="text-xs font-bold text-brand-teal">Latest Data</Text>
                <Text className="text-xs font-sans text-brand-teal/80">
                  {summary.latestFulfilled.readingNumber}
                  {summary.latestFulfilled.electricity?.estimatedAnnualKwh
                    ? ` · ${Math.round(summary.latestFulfilled.electricity.estimatedAnnualKwh).toLocaleString()} kWh/yr`
                    : ''}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-sans text-brand-teal">View →</Text>
          </Pressable>
        )}

        {/* No meter IDs warning */}
        {!hasMeters && (
          <Pressable
            onPress={() => router.push('/(profile-setup)/step-4' as any)}
            className="bg-orange-500/10 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-orange-500/20"
          >
            <Text style={{ fontSize: 14 }}>⚠️</Text>
            <Text className="text-xs font-sans flex-1 leading-4 text-orange-400">
              Add your MPAN/MPRN in Energy Details so we can retrieve your data. Tap to update profile.
            </Text>
          </Pressable>
        )}

        {/* Info strip */}
        {hasMeters && !summary?.latestFulfilled && (
          <View className="bg-primary/13 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-primary/20">
            <Text style={{ fontSize: 14 }}>ℹ️</Text>
            <Text className="text-xs font-sans flex-1 leading-4 text-brand-fg-muted">
              Request your usage data and our team will manually retrieve it from your meter provider.
            </Text>
          </View>
        )}

        {/* Filter tabs */}
        <View className="flex-row -mb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <Pressable
                key={tab.id}
                onPress={() => handleFilter(tab.id)}
                className="flex-1 items-center py-2"
              >
                <Text
                  className={[
                    'text-xs',
                    isActive ? 'font-semibold text-brand-fg' : 'font-sans text-brand-fg-muted',
                  ].join(' ')}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 h-0.5 w-4/5 bg-brand-blue-bright rounded-sm" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Content ── */}
      {isLoadingList && readings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={readings}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ReadingCard item={item} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2272A6" />
          }
          ListEmptyComponent={<EmptyState filter={activeFilter} />}
        />
      )}

      <FAB />
    </View>
  );
}