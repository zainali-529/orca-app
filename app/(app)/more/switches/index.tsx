import { Text } from '@/components/ui/text';
import { useSwitchStore } from '@/lib/store/switch.store';
import type { EnergySwitch, SwitchFuelType, SwitchStatus } from '@/lib/types/switch.types';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Status display config ─────────────────────────────────────────

const STATUS_CFG: Record<SwitchStatus, {
  label:     string;
  emoji:     string;
  bgClass:   string;
  textClass: string;
  step:      number; // for progress bar (0 = terminal negative)
}> = {
  requested:             { label: 'Requested',         emoji: '📋', bgClass: 'bg-primary/13',    textClass: 'text-primary',                               step: 1 },
  submitted_to_supplier: { label: 'Submitted',         emoji: '📤', bgClass: 'bg-primary/13',    textClass: 'text-primary',                               step: 2 },
  cooling_off:           { label: 'Cooling Off',       emoji: '❄️',  bgClass: 'bg-brand-blue-bright/10', textClass: 'text-brand-blue-bright',              step: 3 },
  objected:              { label: 'Objection',         emoji: '⚠️',  bgClass: 'bg-orange-500/10', textClass: 'text-orange-400',                            step: 0 },
  objection_resolved:    { label: 'Objection Cleared', emoji: '✅',  bgClass: 'bg-brand-teal/8',  textClass: 'text-brand-teal',                            step: 3 },
  in_progress:           { label: 'In Progress',       emoji: '⚡',  bgClass: 'bg-primary/13',    textClass: 'text-primary',                               step: 4 },
  pending_completion:    { label: 'Almost Done',       emoji: '🔄', bgClass: 'bg-primary/13',    textClass: 'text-primary',                               step: 5 },
  completed:             { label: 'Completed',         emoji: '✅',  bgClass: 'bg-brand-teal/8',  textClass: 'text-brand-teal',                            step: 6 },
  cancelled:             { label: 'Cancelled',         emoji: '❌',  bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted', step: 0 },
  failed:                { label: 'Failed',            emoji: '💔', bgClass: 'bg-destructive/8', textClass: 'text-destructive',                           step: 0 },
};

const FUEL_LABELS: Record<SwitchFuelType, string> = {
  electricity: '⚡ Electricity',
  gas:         '🔥 Gas',
  dual:        '⚡🔥 Dual Fuel',
};

// ─── Filter tabs ───────────────────────────────────────────────────

const FILTER_TABS: { id: SwitchStatus | 'all'; label: string }[] = [
  { id: 'all',                label: 'All'      },
  { id: 'in_progress',        label: 'Active'   },
  { id: 'cooling_off',        label: 'Cooling'  },
  { id: 'completed',          label: 'Done'     },
  { id: 'cancelled',          label: 'Cancelled'},
];

// ─── Mini progress bar ─────────────────────────────────────────────

function MiniProgress({ step }: { step: number }) {
  const totalSteps = 6;
  if (step === 0) return null; // don't show for terminal negative states
  const filled = Math.max(1, step);

  return (
    <View className="flex-row gap-0.5 mt-2">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <View
          key={i}
          className={[
            'flex-1 h-1 rounded-full',
            i < filled ? 'bg-primary' : 'bg-border',
          ].join(' ')}
        />
      ))}
    </View>
  );
}

// ─── Switch card ───────────────────────────────────────────────────

function SwitchCard({ sw }: { sw: EnergySwitch }) {
  const cfg  = STATUS_CFG[sw.status];
  const date = new Date(sw.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const hasSaving = (sw.contractDetails?.estimatedAnnualSaving ?? 0) > 0;
  const isActive  = sw.isActive;
  const isObjected = sw.status === 'objected';

  return (
    <Pressable onPress={() => router.push(`/(app)/more/switches/${sw._id}` as any)}>
      <View className={[
        'bg-card rounded-card p-4 mb-2.5 border',
        isObjected     ? 'border-orange-500/30' :
        sw.status === 'completed' ? 'border-brand-teal/25' :
        sw.status === 'failed' || sw.status === 'cancelled' ? 'border-border' :
        'border-primary/20',
      ].join(' ')}>

        {/* ── Top row ── */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-1.5 flex-1 flex-wrap mr-2">
            <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${cfg.bgClass}`}>
              <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                {cfg.emoji} {cfg.label}
              </Text>
            </View>
            <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-1.5 py-0.5">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {FUEL_LABELS[sw.fuelType]}
              </Text>
            </View>
          </View>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-shrink-0">
            {date}
          </Text>
        </View>

        {/* ── Supplier change ── */}
        <View className="flex-row items-center gap-2 mb-2">
          <View className="flex-1">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">From</Text>
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg" numberOfLines={1}>
              {sw.currentSupplier}
            </Text>
          </View>

          {/* Arrow */}
          <View className="w-7 h-7 rounded-full bg-primary/10 items-center justify-center">
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#2272A6"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>

          <View className="flex-1">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">To</Text>
            <Text className="text-sm font-bold text-primary" numberOfLines={1}>
              {sw.newSupplier}
            </Text>
          </View>
        </View>

        {/* ── Contract tariff name if available ── */}
        {sw.contractDetails?.tariffName && (
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-1.5" numberOfLines={1}>
            📄 {sw.contractDetails.tariffName}
          </Text>
        )}

        {/* ── Saving highlight ── */}
        {hasSaving && (
          <View className="bg-brand-teal/8 rounded-lg px-2.5 py-1.5 mb-1.5 flex-row items-center gap-1.5">
            <Text className="text-xs font-bold text-brand-teal">
              💰 £{Math.round(sw.contractDetails.estimatedAnnualSaving!).toLocaleString()} est. annual saving
            </Text>
          </View>
        )}

        {/* ── Cooling off countdown ── */}
        {sw.status === 'cooling_off' && sw.coolingOffDaysLeft !== null && (
          <View className="bg-brand-blue-bright/10 rounded-lg px-2.5 py-1.5 mb-1.5 flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-brand-blue-bright">
              ❄️ {sw.coolingOffDaysLeft} day{sw.coolingOffDaysLeft !== 1 ? 's' : ''} cooling off remaining
            </Text>
          </View>
        )}

        {/* ── Objection warning ── */}
        {isObjected && (
          <View className="bg-orange-500/10 rounded-lg px-2.5 py-1.5 mb-1.5">
            <Text className="text-xs font-semibold text-orange-400">
              ⚠️ {sw.objectionReason ?? 'Objection raised — tap for details'}
            </Text>
          </View>
        )}

        {/* ── Progress bar for active switches ── */}
        {isActive && cfg.step > 0 && (
          <MiniProgress step={cfg.step} />
        )}

        {/* ── Switch number ── */}
        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            {sw.switchNumber}
          </Text>
          {sw.estimatedSwitchDate && sw.isActive && (
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Est. {new Date(sw.estimatedSwitchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Empty state ───────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20 mb-4">
        <Text style={{ fontSize: 32 }}>🔄</Text>
      </View>
      <Text className="text-base font-bold text-brand dark:text-brand-fg text-center mb-1.5">
        {filter === 'all' ? 'No switches yet' : `No ${filter} switches`}
      </Text>
      <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
        {filter === 'all'
          ? 'When your broker initiates an energy switch, it will appear here with live tracking.'
          : `You have no ${filter} switches at the moment.`}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function SwitchesIndexScreen() {
  const { switches, pagination, summary, isLoadingList, loadSwitches, loadSummary } =
    useSwitchStore();

  const [activeFilter, setActiveFilter] = React.useState<SwitchStatus | 'all'>('all');
  const [refreshing,   setRefreshing]   = React.useState(false);

  const fetch = React.useCallback(
    (f: SwitchStatus | 'all' = activeFilter) =>
      loadSwitches(f === 'all' ? { limit: 30 } : { status: f, limit: 30 }),
    [activeFilter]
  );

  React.useEffect(() => {
    fetch();
    loadSummary();
  }, []);

  const handleFilter = (f: SwitchStatus | 'all') => {
    setActiveFilter(f);
    loadSwitches(f === 'all' ? { limit: 30 } : { status: f, limit: 30 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetch(), loadSummary()]);
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-4 px-5">

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-brand-fg">Switch Tracker</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {pagination
                ? `${pagination.total} switch${pagination.total !== 1 ? 'es' : ''}`
                : 'Track your energy switches'}
            </Text>
          </View>
        </View>

        {/* Stats row */}
        {summary && summary.total > 0 && (
          <View className="flex-row gap-2 mb-3 flex-wrap">
            {summary.active > 0 && (
              <View className="bg-primary/15 border border-primary/25 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-fg">{summary.active}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Active</Text>
              </View>
            )}
            {summary.completed > 0 && (
              <View className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-teal">{summary.completed}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Completed</Text>
              </View>
            )}
            {summary.cooling_off > 0 && (
              <View className="bg-brand-blue-bright/10 border border-brand-blue-bright/20 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-blue-bright">{summary.cooling_off}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Cooling Off</Text>
              </View>
            )}
            {summary.objected > 0 && (
              <View className="bg-orange-500/15 border border-orange-500/25 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-orange-400">{summary.objected}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Objected</Text>
              </View>
            )}
          </View>
        )}

        {/* Info strip */}
        <View className="bg-primary/13 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-primary/20">
          <Text style={{ fontSize: 14 }}>ℹ️</Text>
          <Text className="text-xs font-sans flex-1 leading-4 text-brand-fg-muted">
            Your broker manages all switches. You'll see live updates here as your switch progresses.
          </Text>
        </View>

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
      {isLoadingList && switches.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={switches}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <SwitchCard sw={item} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2272A6" />
          }
          ListEmptyComponent={<EmptyState filter={activeFilter} />}
        />
      )}
    </View>
  );
}