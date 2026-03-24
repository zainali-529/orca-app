import { Text } from '@/components/ui/text';
import { useMeterReadingStore } from '@/lib/store/meter.store';
import type { MeterReadingStatus } from '@/lib/types/meter.types';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Rect } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CFG: Record<MeterReadingStatus, {
  label: string; emoji: string;
  bgClass: string; textClass: string;
  desc: string; step: number;
}> = {
  requested:  {
    label: 'Requested',  emoji: '📡',
    bgClass: 'bg-primary/13', textClass: 'text-primary',
    desc: 'Your request has been received. Our team will begin retrieving your data shortly.',
    step: 1,
  },
  processing: {
    label: 'Processing', emoji: '⚙️',
    bgClass: 'bg-orange-500/10', textClass: 'text-orange-400',
    desc: 'Our team is actively pulling your meter data from the provider.',
    step: 2,
  },
  fulfilled:  {
    label: 'Fulfilled',  emoji: '✅',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal',
    desc: 'Your consumption data has been retrieved and is ready to view below.',
    step: 3,
  },
  failed:     {
    label: 'Failed',     emoji: '❌',
    bgClass: 'bg-destructive/8', textClass: 'text-destructive',
    desc: 'We were unable to retrieve your meter data. Please contact your broker.',
    step: 0,
  },
};

const PROGRESS_STEPS = [
  { step: 1, label: 'Requested' },
  { step: 2, label: 'Processing' },
  { step: 3, label: 'Fulfilled' },
];

const SOURCE_LABELS: Record<string, string> = {
  manual:           'Manual lookup',
  n3rgy_api:        'n3rgy API',
  supplier_portal:  'Supplier portal',
  smart_meter_app:  'Smart meter app',
};

// ─── Progress tracker ──────────────────────────────────────────────

function ProgressTracker({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;
  return (
    <View className="relative">
      <View className="absolute top-[18px] left-[18px] right-[18px] h-0.5 bg-border" />
      <View className="flex-row justify-between">
        {PROGRESS_STEPS.map((s) => {
          const done   = s.step < currentStep;
          const active = s.step === currentStep;
          return (
            <View key={s.step} className="items-center gap-1.5 flex-1">
              <View className={[
                'w-9 h-9 rounded-full items-center justify-center z-10',
                done   ? 'bg-brand-teal/15 border border-brand-teal/40' :
                active ? 'bg-primary/15 border-2 border-primary' :
                         'bg-muted dark:bg-border/20 border border-border',
              ].join(' ')}>
                {done
                  ? <Svg width="14" height="14" viewBox="0 0 14 14">
                      <Path d="M2.5 7l3 3L11 3.5" fill="none" stroke="#2DD4A0"
                        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  : active ? <View className="w-2 h-2 rounded-full bg-primary" />
                  : <View className="w-1.5 h-1.5 rounded-full bg-border" />
                }
              </View>
              <Text className={[
                'text-xs text-center',
                done || active ? 'font-semibold text-brand dark:text-brand-fg' : 'font-sans text-[#4A6A82] dark:text-brand-fg-muted',
              ].join(' ')}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Info row ──────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-border">
      <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-1 mr-4">
        {label}
      </Text>
      <Text className="text-sm font-medium text-brand dark:text-brand-fg flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

// ─── Consumption card ──────────────────────────────────────────────

function ConsumptionCard({
  fuelType,
  data,
}: {
  fuelType: 'electricity' | 'gas';
  data: NonNullable<import('@/lib/types/meter.types').MeterReading['electricity']>;
}) {
  const isElec = fuelType === 'electricity';
  const icon   = isElec ? '⚡' : '🔥';
  const label  = isElec ? 'Electricity' : 'Gas';
  const accentClass = isElec ? 'text-brand-blue-bright' : 'text-orange-400';
  const bgClass     = isElec ? 'bg-primary/6 dark:bg-brand-selected/20' : 'bg-orange-500/6 dark:bg-orange-500/8';
  const borderClass = isElec ? 'border-primary/15' : 'border-orange-500/15';

  return (
    <View className={`rounded-card p-4 border ${bgClass} ${borderClass}`}>
      <View className="flex-row items-center gap-2 mb-3">
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <Text className="text-sm font-bold text-brand dark:text-brand-fg">{label} Consumption</Text>
      </View>

      {/* Key metrics grid */}
      <View className="flex-row flex-wrap gap-2 mb-3">
        {[
          { label: 'Annual Est.',   value: data.estimatedAnnualKwh ? `${Math.round(data.estimatedAnnualKwh).toLocaleString()} kWh` : null },
          { label: 'Daily Avg',     value: data.dailyAvgKwh ? `${data.dailyAvgKwh.toFixed(1)} kWh` : null },
          { label: 'Monthly Avg',   value: data.monthlyAvgKwh ? `${Math.round(data.monthlyAvgKwh)} kWh` : null },
          { label: 'Period Total',  value: data.totalKwh ? `${Math.round(data.totalKwh).toLocaleString()} kWh` : null },
        ].filter((m) => m.value).map((metric) => (
          <View
            key={metric.label}
            className="flex-1 bg-background dark:bg-card rounded-xl p-2.5 items-center border border-border min-w-[80px]"
          >
            <Text className={`text-sm font-bold ${accentClass}`}>{metric.value}</Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
              {metric.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Annual cost estimate */}
      {data.estimatedAnnualCost && (
        <View className="bg-brand-teal/8 rounded-xl p-3 border border-brand-teal/20 flex-row justify-between items-center">
          <Text className="text-sm font-sans text-brand-teal">Est. Annual Cost</Text>
          <Text className="text-lg font-bold text-brand-teal">
            £{Math.round(data.estimatedAnnualCost).toLocaleString()}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Mini bar chart (for raw readings) ────────────────────────────

function MiniBarChart({ readings }: { readings: import('@/lib/types/meter.types').ReadingDataPoint[] }) {
  if (!readings || readings.length === 0) return null;

  // Take last 14 data points
  const data = readings.slice(-14);
  const maxVal = Math.max(...data.map((r) => r.value), 1);

  return (
    <View className="bg-card rounded-card p-4 border border-border">
      <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
        📈 Consumption Chart ({data.length} readings)
      </Text>
      <View className="flex-row items-end gap-1 h-24">
        {data.map((point, i) => {
          const pct     = Math.max(point.value / maxVal, 0.04);
          const isEst   = point.readingType === 'estimated';
          const barH    = Math.round(pct * 88);
          const isLast  = i === data.length - 1;
          return (
            <View key={i} className="flex-1 items-center" style={{ maxWidth: 28 }}>
              <View
                className={[
                  'w-full rounded-sm',
                  isLast ? 'bg-primary' :
                  isEst  ? 'bg-[#2272A660]' :
                           'bg-primary/40',
                ].join(' ')}
                style={{ height: barH }}
              />
            </View>
          );
        })}
      </View>
      <View className="flex-row items-center gap-3 mt-2">
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-sm bg-primary/40" />
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Actual</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-sm bg-[#2272A660]" />
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Estimated</Text>
        </View>
        <View className="flex-row items-center gap-1">
          <View className="w-2.5 h-2.5 rounded-sm bg-primary" />
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Latest</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function MeterReadingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedReading, isLoadingDetail, loadReading, deleteReading } = useMeterReadingStore();

  const contentOpacity = useSharedValue(0);
  const contentY       = useSharedValue(20);

  React.useEffect(() => {
    if (id) loadReading(id);
  }, [id]);

  React.useEffect(() => {
    if (selectedReading) {
      contentOpacity.value = withDelay(80, withTiming(1,  { duration: 350 }));
      contentY.value       = withDelay(80, withSpring(0,  { damping: 18 }));
    }
  }, [selectedReading]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!selectedReading) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">Not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-banner px-5 py-2.5">
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const r      = selectedReading;
  const cfg    = STATUS_CFG[r.status];
  const isFulfilled = r.status === 'fulfilled';
  const isPending   = r.status === 'requested';
  const isFailed    = r.status === 'failed';

  const createdDate = new Date(r.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const FUEL_LABELS: Record<string, string> = {
    electricity: '⚡ Electricity',
    gas:         '🔥 Gas',
    both:        '⚡🔥 Both',
  };

  const REQUEST_TYPE_LABELS: Record<string, string> = {
    current_usage:   'Current Usage',
    historical:      'Historical Period',
    annual_estimate: 'Annual Estimate',
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Request',
      'Delete this meter reading request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try {
              await deleteReading(r._id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete.');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Meter Readings</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1 flex-wrap">
              <Text className="text-xs font-bold text-brand-blue-bright">{r.readingNumber}</Text>
              <View className={`px-2 py-0.5 rounded-full ${cfg.bgClass}`}>
                <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                  {cfg.emoji} {cfg.label}
                </Text>
              </View>
            </View>
            <Text className="text-xl font-bold text-brand-fg">
              {FUEL_LABELS[r.fuelType] ?? r.fuelType} Data
            </Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {REQUEST_TYPE_LABELS[r.requestType] ?? r.requestType} · Requested {createdDate}
            </Text>
          </View>

          <View className="w-12 h-12 rounded-xl bg-primary/13 border border-primary/25 items-center justify-center flex-shrink-0">
            <Text style={{ fontSize: 22 }}>📡</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={animStyle} className="gap-3">

          {/* ── Progress tracker ── */}
          {cfg.step > 0 && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-4">
                Request Progress
              </Text>
              <ProgressTracker currentStep={cfg.step} />
              <View className={`mt-4 p-3 rounded-xl ${cfg.bgClass}`}>
                <Text className={`text-sm font-sans leading-5 ${cfg.textClass}`}>
                  {cfg.desc}
                </Text>
              </View>
            </View>
          )}

          {/* ── Failed ── */}
          {isFailed && (
            <View className="bg-destructive/8 rounded-card p-4 border border-destructive/20">
              <Text className="text-sm font-bold text-destructive mb-1">❌ Unable to Retrieve Data</Text>
              {r.failureReason && (
                <Text className="text-sm font-sans text-destructive/80 leading-5">
                  {r.failureReason}
                </Text>
              )}
              <Text className="text-xs font-sans text-destructive/70 mt-2">
                Contact your broker to discuss alternative options or re-request.
              </Text>
            </View>
          )}

          {/* ── Electricity consumption ── */}
          {isFulfilled && r.electricity && (
            <ConsumptionCard fuelType="electricity" data={r.electricity} />
          )}

          {/* ── Gas consumption ── */}
          {isFulfilled && r.gas && (
            <ConsumptionCard fuelType="gas" data={r.gas} />
          )}

          {/* ── Raw readings chart ── */}
          {isFulfilled && r.readings && r.readings.length > 0 && (
            <MiniBarChart readings={r.readings} />
          )}

          {/* ── Combined summary (dual fuel) ── */}
          {isFulfilled && r.electricity && r.gas && (
            <View className="bg-primary/7 dark:bg-brand-selected/20 rounded-card p-4 border border-primary/20">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
                ⚡🔥 Combined Usage Summary
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1 bg-background dark:bg-card rounded-xl p-3 border border-border items-center">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-1">
                    Total Annual
                  </Text>
                  <Text className="text-base font-bold text-primary">
                    {(
                      (r.electricity.estimatedAnnualKwh ?? 0) +
                      (r.gas.estimatedAnnualKwh ?? 0)
                    ).toLocaleString()} kWh
                  </Text>
                </View>
                {(r.electricity.estimatedAnnualCost || r.gas.estimatedAnnualCost) && (
                  <View className="flex-1 bg-background dark:bg-card rounded-xl p-3 border border-border items-center">
                    <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-1">
                      Est. Total Cost
                    </Text>
                    <Text className="text-base font-bold text-brand-teal">
                      £{Math.round(
                        (r.electricity.estimatedAnnualCost ?? 0) +
                        (r.gas.estimatedAnnualCost ?? 0)
                      ).toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Profile updated notice ── */}
          {isFulfilled && (
            <View className="bg-brand-teal/8 rounded-banner p-3 border border-brand-teal/20 flex-row items-start gap-2">
              <Text style={{ fontSize: 14 }}>✅</Text>
              <Text className="text-xs font-sans flex-1 leading-4 text-brand-teal">
                Your annual usage figures in your profile have been automatically updated with this data.
              </Text>
            </View>
          )}

          {/* ── Request details ── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Request Details
            </Text>
            <InfoRow label="Reference"    value={r.readingNumber} />
            <InfoRow label="Fuel type"    value={FUEL_LABELS[r.fuelType]} />
            <InfoRow label="Request type" value={REQUEST_TYPE_LABELS[r.requestType]} />
            {r.mpan && <InfoRow label="MPAN (Elec)" value={r.mpan} />}
            {r.mprn && <InfoRow label="MPRN (Gas)"  value={r.mprn} />}
            {r.periodFrom && (
              <InfoRow
                label="Period from"
                value={new Date(r.periodFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              />
            )}
            {r.periodTo && (
              <InfoRow
                label="Period to"
                value={new Date(r.periodTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              />
            )}
            {r.clientNotes && <InfoRow label="Your notes" value={r.clientNotes} />}
          </View>

          {/* ── Fulfillment details ── */}
          {isFulfilled && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
                Data Details
              </Text>
              <InfoRow label="Source" value={r.dataSource ? SOURCE_LABELS[r.dataSource] ?? r.dataSource : null} />
              {r.dataFrom && (
                <InfoRow
                  label="Data from"
                  value={new Date(r.dataFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
              )}
              {r.dataTo && (
                <InfoRow
                  label="Data to"
                  value={new Date(r.dataTo).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                />
              )}
              {r.fulfilledAt && (
                <InfoRow
                  label="Fulfilled on"
                  value={new Date(r.fulfilledAt).toLocaleDateString('en-GB', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                />
              )}
              {r.readings && r.readings.length > 0 && (
                <InfoRow label="Data points" value={`${r.readings.length} readings`} />
              )}
            </View>
          )}

          {/* ── Compare tariffs CTA ── */}
          {isFulfilled && (
            <Pressable
              onPress={() => router.push('/(app)/tariffs' as any)}
              className="bg-primary h-12 rounded-card items-center justify-center flex-row gap-2"
            >
              <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
                ⚡ Compare Tariffs With My Usage
              </Text>
            </Pressable>
          )}

          {/* ── Legal ── */}
          <View className="bg-primary/6 dark:bg-brand-selected rounded-banner p-3 border border-primary/15">
            <Text className="text-xs font-sans leading-[17px] text-[#4A6A82] dark:text-brand-fg-muted">
              Meter data is retrieved via the DCC or your supplier's portal. Usage figures are estimates
              based on available data. Annual estimates may vary from actual billed usage.
            </Text>
          </View>

          {/* ── Delete button (pending only) ── */}
          {isPending && (
            <Pressable onPress={handleDelete} className="items-center py-3">
              <Text className="text-sm font-semibold text-destructive">Delete This Request</Text>
            </Pressable>
          )}

          {/* ── Request again ── */}
          {(isFulfilled || isFailed) && (
            <Pressable
              onPress={() => router.push('/(app)/more/meter-readings/request' as any)}
              className="bg-card border border-border h-11 rounded-banner items-center justify-center"
            >
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
                Request New Reading
              </Text>
            </Pressable>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}