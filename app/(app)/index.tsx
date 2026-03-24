/**
 * Dashboard Screen — app/(app)/index.tsx
 *
 * Full personalised client dashboard integrating all backend modules.
 * Sections (top → bottom):
 *   1. Header — greeting, profile ring, alert badge
 *   2. Savings Potential Hero — best deal vs current cost
 *   3. Summary Chips — active counts per module
 *   4. Smart Alerts — priority-sorted action items
 *   5. Active Switch — live progress tracker
 *   6. Pipeline Overview — 5-module snapshot cards
 *   7. Upcoming Events — consultations + contract renewals
 *   8. Recent Activity — cross-module feed
 *   9. Energy Snapshot — meter IDs, suppliers, usage
 *  10. Quick Stats — lifetime numbers
 */

import { Text }             from '@/components/ui/text';
import { useAuthStore }     from '@/lib/store/auth.store';
import { useDashboardStore } from '@/lib/store/dashboard.store';
import { router }           from 'expo-router';
import { useColorScheme }   from 'nativewind';
import * as React           from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  FadeInDown,
  SlideInRight,
} from 'react-native-reanimated';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import type {
  ActiveSwitch,
  ActivityItem,
  DashboardAlert,
  DashboardSummary,
  EnergySnapshot,
  LatestMeterReading,
  QuickStats,
  SavingsPotential,
  UpcomingEvent,
  DashboardPipeline,
} from '@/lib/types/dashboard.types';

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const fmt = {
  currency: (n: number) =>
    n >= 1000 ? `£${(n / 1000).toFixed(1)}k` : `£${Math.round(n)}`,
  kwh: (n: number) =>
    n >= 1000 ? `${(n / 1000).toFixed(1)}k kWh` : `${Math.round(n)} kWh`,
  date: (s: string) =>
    new Date(s).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    }),
  timeAgo: (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const m    = Math.floor(diff / 60000);
    const h    = Math.floor(m / 60);
    const d    = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return 'just now';
  },
};

// ─────────────────────────────────────────────────────────────────
// PROFILE COMPLETION RING
// ─────────────────────────────────────────────────────────────────

function CompletionRing({ percent }: { percent: number }) {
  const SIZE = 44;
  const STROKE = 3.5;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dash = (percent / 100) * CIRC;

  const color =
    percent >= 80 ? '#2DD4A0' :
    percent >= 50 ? '#2272A6' : '#F59E0B';

  return (
    <View style={{ width: SIZE, height: SIZE, position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={STROKE}
          fill="none"
        />
        {/* Progress */}
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={color}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${dash} ${CIRC - dash}`}
          strokeDashoffset={CIRC / 4}
          strokeLinecap="round"
        />
      </Svg>
      <Text style={{ fontSize: 10, fontWeight: '700', color: '#F0F8FF' }}>
        {percent}%
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────

function SectionHeader({
  title, action, onAction,
}: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View className="flex-row items-center justify-between mb-3 px-0.5">
      <Text className="text-sm font-bold text-brand dark:text-brand-fg">{title}</Text>
      {action && onAction && (
        <Pressable onPress={onAction} hitSlop={12}>
          <Text className="text-xs font-semibold text-primary">{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// SAVINGS POTENTIAL HERO
// ─────────────────────────────────────────────────────────────────

function SavingsHero({ data }: { data: SavingsPotential }) {
  const saving = data.potentialSaving ?? 0;
  const monthly = data.annualSavingMonthly ?? 0;
  const hasDeal = !!data.bestTariff;
  const isReal  = data.dataQuality === 'from_meter';

  if (saving <= 0 && !hasDeal) return null;

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()}>
      <Pressable
        onPress={() => hasDeal
          ? router.push(`/(app)/tariffs/${data.bestTariff!._id}` as any)
          : router.push('/(app)/tariffs' as any)
        }
      >
        {/* Outer card with gradient border effect */}
        <View
          className="rounded-card overflow-hidden mb-3.5"
          style={{
            shadowColor: '#2272A6',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.22,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          {/* Navy gradient header */}
          <View className="bg-brand p-4 pb-3">
            {/* Top row */}
            <View className="flex-row items-start justify-between mb-3">
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <View className="bg-brand-teal/20 border border-brand-teal/30 rounded-full px-2.5 py-0.5">
                    <Text className="text-xs font-bold text-brand-teal">
                      💰 SAVINGS POTENTIAL
                    </Text>
                  </View>
                  {isReal && (
                    <View className="bg-primary/20 border border-primary/30 rounded-full px-2 py-0.5">
                      <Text className="text-xs font-semibold text-brand-blue-bright">📡 Real data</Text>
                    </View>
                  )}
                </View>
                <Text className="text-brand-fg-muted text-xs font-sans mt-0.5">
                  Based on {fmt.kwh(data.basedOn.annualElecKwh)} elec + {fmt.kwh(data.basedOn.annualGasKwh)} gas/yr
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-brand-fg-muted text-xs font-sans">Current est.</Text>
                <Text className="text-brand-fg text-base font-bold">
                  {fmt.currency(data.currentAnnualCost)}/yr
                </Text>
              </View>
            </View>

            {/* Big saving number */}
            {saving > 0 && (
              <View className="items-center py-2">
                <Text style={{ fontSize: 10, letterSpacing: 1.5 }} className="text-brand-fg-muted font-sans mb-1">
                  YOU COULD SAVE UP TO
                </Text>
                <Text style={{ fontSize: 42, lineHeight: 48 }} className="font-bold text-brand-teal">
                  {fmt.currency(saving)}
                </Text>
                <Text className="text-brand-fg-muted text-sm font-sans mt-0.5">
                  per year  ·  ~{fmt.currency(monthly)} per month
                </Text>
              </View>
            )}
          </View>

          {/* White/card bottom section */}
          {hasDeal && (
            <View className="bg-card px-4 py-3 flex-row items-center justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-1.5 mb-0.5">
                  <Text className="text-xs font-semibold text-brand dark:text-brand-fg">
                    {data.bestTariff!.supplier}
                  </Text>
                  {data.bestTariff!.isGreen && <Text style={{ fontSize: 10 }}>🌿</Text>}
                </View>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted" numberOfLines={1}>
                  {data.bestTariff!.tariffName}
                </Text>
                <View className="flex-row gap-2 mt-1">
                  <Text className="text-xs font-bold text-brand-blue-bright">
                    ⚡ {data.bestTariff!.electricityUnitRate}p/kWh
                  </Text>
                  <Text className="text-xs font-bold text-orange-400">
                    🔥 {data.bestTariff!.gasUnitRate}p/kWh
                  </Text>
                </View>
              </View>
              <View
                className="bg-primary rounded-banner px-3.5 py-2"
                style={{ shadowColor: '#2272A6', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
              >
                <Text style={{ color: '#fff' }} className="text-xs font-bold">View Deal →</Text>
              </View>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// SUMMARY CHIPS
// ─────────────────────────────────────────────────────────────────

interface SummaryChip {
  label:   string;
  value:   number;
  icon:    string;
  route:   string;
  accent?: 'blue' | 'teal' | 'orange' | 'red';
  badge?:  boolean;  // show dot if > 0
}

function SummaryChipRow({ summary }: { summary: DashboardSummary }) {
  const chips: SummaryChip[] = [
    {
      label: 'Active Switches', value: summary.activeSwitches,
      icon: '🔄', route: '/(app)/more/switches', accent: 'blue',
    },
    {
      label: 'Pending Docs', value: summary.pendingDocuments,
      icon: '✍️', route: '/(app)/documents',
      accent: summary.hasBrokerDocuments ? 'orange' : 'blue', badge: true,
    },
    {
      label: 'Consultations', value: summary.upcomingConsultations,
      icon: '📅', route: '/(app)/more/consultations', accent: 'teal',
    },
    {
      label: 'Meter Requests', value: summary.pendingMeterRequests,
      icon: '📡', route: '/(app)/more/meter-readings' as any, accent: 'blue',
    },
    {
      label: 'Quotes', value: summary.pendingQuotes,
      icon: '📋', route: '/(app)/quotes', accent: 'blue',
    },
  ];

  const active = chips.filter((c) => c.value > 0);
  if (active.length === 0) return null;

  const ACCENT_STYLES = {
    blue:   { bg: 'bg-primary/10',           border: 'border-primary/20',       text: 'text-brand-blue-bright' },
    teal:   { bg: 'bg-brand-teal/10',        border: 'border-brand-teal/20',    text: 'text-brand-teal' },
    orange: { bg: 'bg-orange-500/10',         border: 'border-orange-500/20',    text: 'text-orange-400' },
    red:    { bg: 'bg-destructive/10',        border: 'border-destructive/20',   text: 'text-destructive' },
  };

  return (
    <Animated.View entering={FadeInDown.delay(150).springify()} className="mb-3.5">
      <SectionHeader title="At a Glance" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 2 }}
      >
        {active.map((chip, i) => {
          const s = ACCENT_STYLES[chip.accent ?? 'blue'];
          return (
            <Animated.View
              key={chip.label}
              entering={SlideInRight.delay(i * 60).springify()}
            >
              <Pressable
                onPress={() => router.push(chip.route as any)}
                className={`rounded-xl p-3 border ${s.bg} ${s.border}`}
                style={{ minWidth: 90 }}
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ fontSize: 18 }}>{chip.icon}</Text>
                  {chip.badge && chip.value > 0 && (
                    <View className="w-2 h-2 rounded-full bg-orange-400" />
                  )}
                </View>
                <Text className={`text-xl font-bold ${s.text}`}>{chip.value}</Text>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5" numberOfLines={2}>
                  {chip.label}
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// SMART ALERTS
// ─────────────────────────────────────────────────────────────────

const ALERT_STYLES = {
  high: {
    bg:     'bg-destructive/8',
    border: 'border-destructive/25',
    dot:    'bg-destructive',
    text:   'text-destructive',
  },
  medium: {
    bg:     'bg-orange-500/10',
    border: 'border-orange-500/20',
    dot:    'bg-orange-400',
    text:   'text-orange-400',
  },
  info: {
    bg:     'bg-primary/8',
    border: 'border-primary/20',
    dot:    'bg-primary',
    text:   'text-primary',
  },
};

function AlertCard({ alert, index }: { alert: DashboardAlert; index: number }) {
  const s = ALERT_STYLES[alert.severity];
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()}>
      <Pressable
        onPress={() => {
          let route = alert.actionRoute;
          // Moved routes need to be prefixed with more/
          const moved = ['switches', 'consultations', 'meter-readings'];
          const base = route.split('/')[0];
          if (moved.includes(base)) {
            route = `more/${route}`;
          }
          router.push(`/(app)/${route}` as any);
        }}
      >
        <View className={`rounded-card p-3.5 mb-2 border flex-row items-start gap-3 ${s.bg} ${s.border}`}>
          {/* Severity dot */}
          <View className="mt-1.5 flex-shrink-0">
            <View className={`w-2 h-2 rounded-full ${s.dot}`} />
          </View>
          {/* Icon + content */}
          <View className="flex-1">
            <View className="flex-row items-start gap-2">
              <Text style={{ fontSize: 15 }} className="flex-shrink-0">{alert.icon}</Text>
              <View className="flex-1">
                <Text className={`text-sm font-semibold leading-5 ${s.text}`} numberOfLines={2}>
                  {alert.title}
                </Text>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5 leading-4" numberOfLines={2}>
                  {alert.description}
                </Text>
              </View>
            </View>
          </View>
          {/* Chevron */}
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ marginTop: 4, flexShrink: 0 }}>
            <Path d="M9 18l6-6-6-6" stroke="#8BA8C4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function AlertsSection({ alerts }: { alerts: DashboardAlert[] }) {
  const [expanded, setExpanded] = React.useState(false);
  if (alerts.length === 0) return null;

  const highCount = alerts.filter((a) => a.severity === 'high').length;
  const visible   = expanded ? alerts : alerts.slice(0, 3);

  return (
    <Animated.View entering={FadeInDown.delay(200).springify()} className="mb-3.5">
      <SectionHeader
        title={`⚡ Action Required${highCount > 0 ? ` (${highCount} urgent)` : ''}`}
      />
      {visible.map((a, i) => (
        <AlertCard key={`${a.type}-${i}`} alert={a} index={i} />
      ))}
      {alerts.length > 3 && (
        <Pressable
          onPress={() => setExpanded((p) => !p)}
          className="bg-card border border-border rounded-banner h-9 items-center justify-center mt-1"
        >
          <Text className="text-xs font-semibold text-[#4A6A82] dark:text-brand-fg-muted">
            {expanded ? 'Show less ▲' : `Show ${alerts.length - 3} more ▼`}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// ACTIVE SWITCH TRACKER
// ─────────────────────────────────────────────────────────────────

const SWITCH_STEP: Record<string, number> = {
  requested:             1,
  submitted_to_supplier: 2,
  cooling_off:           3,
  objection_resolved:    3,
  objected:              0,
  in_progress:           4,
  pending_completion:    5,
  completed:             6,
  cancelled:             0,
  failed:                0,
};

const SWITCH_STATUS_LABEL: Record<string, string> = {
  requested:             'Requested — broker preparing',
  submitted_to_supplier: 'Submitted to supplier',
  cooling_off:           '❄️ Cooling-off period',
  objected:              '⚠️ Objection raised',
  objection_resolved:    'Objection resolved',
  in_progress:           '⚡ Switch in progress',
  pending_completion:    'Finalising with supplier',
  completed:             '✅ Switch complete!',
  cancelled:             '❌ Cancelled',
  failed:                '💔 Switch failed',
};

function ActiveSwitchCard({ sw }: { sw: ActiveSwitch }) {
  const step      = SWITCH_STEP[sw.status] ?? 0;
  const isNegative = step === 0;
  const TOTAL     = 6;
  const saving    = sw.contractDetails?.estimatedAnnualSaving;

  return (
    <Animated.View entering={FadeInDown.delay(250).springify()} className="mb-3.5">
      <SectionHeader
        title="🔄 Active Switch"
        action="Details"
        onAction={() => router.push(`/(app)/more/switches/${sw._id}` as any)}
      />
      <Pressable onPress={() => router.push(`/(app)/more/switches/${sw._id}` as any)}>
        <View
          className="bg-card rounded-card p-4 border border-primary/20"
          style={{
            shadowColor: '#2272A6',
            shadowOffset: { width: 0, height: 3 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
        >
          {/* Supplier row */}
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-sm font-semibold text-[#4A6A82] dark:text-brand-fg-muted" numberOfLines={1} style={{ maxWidth: 100 }}>
              {sw.currentSupplier}
            </Text>
            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <Path d="M5 12h14M12 5l7 7-7 7" stroke="#2272A6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text className="text-base font-bold text-brand dark:text-brand-fg flex-1" numberOfLines={1}>
              {sw.newSupplier}
            </Text>
            {saving && saving > 0 && (
              <View className="bg-brand-teal/10 border border-brand-teal/20 rounded-lg px-2 py-1 flex-shrink-0">
                <Text className="text-xs font-bold text-brand-teal">
                  Save £{Math.round(saving)}/yr
                </Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          {!isNegative && (
            <View className="mb-2.5">
              <View className="flex-row gap-1 mb-1.5">
                {Array.from({ length: TOTAL }).map((_, i) => (
                  <View
                    key={i}
                    className={[
                      'flex-1 h-1.5 rounded-full',
                      i < step ? 'bg-primary' : 'bg-border',
                    ].join(' ')}
                  />
                ))}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Step {step} of {TOTAL}
                </Text>
                <Text className="text-xs font-semibold text-primary">
                  {Math.round((step / TOTAL) * 100)}% complete
                </Text>
              </View>
            </View>
          )}

          {/* Status */}
          <View className={[
            'rounded-xl px-3 py-2',
            sw.status === 'cooling_off' ? 'bg-brand-blue-bright/10' :
            sw.status === 'objected'    ? 'bg-orange-500/10' :
            isNegative                  ? 'bg-destructive/8' :
            'bg-primary/8',
          ].join(' ')}>
            <Text className={[
              'text-xs font-semibold',
              sw.status === 'cooling_off' ? 'text-brand-blue-bright' :
              sw.status === 'objected'    ? 'text-orange-400' :
              isNegative                  ? 'text-destructive' :
              'text-primary',
            ].join(' ')}>
              {SWITCH_STATUS_LABEL[sw.status] ?? sw.status.replace(/_/g, ' ')}
            </Text>
          </View>

          {/* Cooling off days */}
          {sw.status === 'cooling_off' && sw.coolingOffDaysLeft != null && (
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1.5">
              ❄️ {sw.coolingOffDaysLeft} days remaining to cancel penalty-free
            </Text>
          )}

          {/* Ref */}
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1.5">
            {sw.switchNumber}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// PIPELINE OVERVIEW
// ─────────────────────────────────────────────────────────────────

function PipelineCard({
  icon, title, primary, primaryLabel, secondary, secondaryLabel, route, delay: d,
}: {
  icon: string; title: string; primary: number; primaryLabel: string;
  secondary?: number; secondaryLabel?: string; route: string; delay: number;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(d).springify()}>
      <Pressable onPress={() => router.push(route as any)}>
        <View
          className="bg-card rounded-card p-3.5 border border-border"
          style={{ width: 130 }}
        >
          <Text style={{ fontSize: 22 }} className="mb-2">{icon}</Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-1" numberOfLines={1}>
            {title}
          </Text>
          <Text className="text-2xl font-bold text-brand dark:text-brand-fg">{primary}</Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">{primaryLabel}</Text>
          {secondary !== undefined && secondary > 0 && secondaryLabel && (
            <View className="mt-1.5 bg-brand-teal/10 rounded-md px-1.5 py-0.5 self-start">
              <Text className="text-xs font-bold text-brand-teal">
                {secondary} {secondaryLabel}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function PipelineOverview({ pipeline }: { pipeline: DashboardPipeline }) {
  const modules = [
    {
      icon: '📋', title: 'Quotes',
      primary: pipeline.quotes.pending + pipeline.quotes.contacted,
      primaryLabel: 'active',
      secondary: pipeline.quotes.completed, secondaryLabel: 'done',
      route: '/(app)/quotes', delay: 280,
    },
    {
      icon: '✍️', title: 'Documents',
      primary: pipeline.documents.pendingSignature,
      primaryLabel: 'to sign',
      secondary: pipeline.documents.signed, secondaryLabel: 'signed',
      route: '/(app)/documents', delay: 320,
    },
    {
      icon: '🔄', title: 'Switches',
      primary: pipeline.switches.active,
      primaryLabel: 'active',
      secondary: pipeline.switches.completed, secondaryLabel: 'done',
      route: '/(app)/more/switches', delay: 360,
    },
    {
      icon: '💡', title: 'Consultations',
      primary: pipeline.consultations.scheduled + pipeline.consultations.confirmed,
      primaryLabel: 'upcoming',
      secondary: pipeline.consultations.completed, secondaryLabel: 'done',
      route: '/(app)/more/consultations', delay: 400,
    },
    {
      icon: '📡', title: 'Meter Data',
      primary: pipeline.meterReadings.requested + pipeline.meterReadings.processing,
      primaryLabel: 'in progress',
      secondary: pipeline.meterReadings.fulfilled, secondaryLabel: 'ready',
      route: '/(app)/more/meter-readings' as any, delay: 440,
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(260).springify()} className="mb-3.5">
      <SectionHeader title="📊 Your Pipeline" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingRight: 2 }}
      >
        {modules.map((m) => (
          <PipelineCard key={m.title} {...m} />
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// UPCOMING EVENTS
// ─────────────────────────────────────────────────────────────────

function EventItem({ event, isLast }: { event: UpcomingEvent; isLast: boolean }) {
  const isUrgent = event.urgency === 'high';
  const isMed    = event.urgency === 'medium';

  const dotColor =
    isUrgent ? 'bg-orange-400' :
    isMed    ? 'bg-primary' :
               'bg-brand-teal';

  const borderColor =
    isUrgent ? 'border-orange-400/30' :
    isMed    ? 'border-primary/30' :
               'border-brand-teal/30';

  const isConsultation = event.type === 'consultation';

  const handlePress = () => {
    if (isConsultation && event.id) {
      router.push(`/(app)/more/consultations/${event.id}` as any);
    } else {
      router.push('/(app)/tariffs' as any);
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <View className="flex-row gap-3 pb-3">
        {/* Timeline column */}
        <View className="items-center" style={{ width: 24 }}>
          <View className={`w-3 h-3 rounded-full mt-1 ${dotColor}`} />
          {!isLast && (
            <View className={`w-px flex-1 mt-1 border-l border-dashed ${borderColor}`} style={{ minHeight: 24 }} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1 pb-1">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg leading-5" numberOfLines={2}>
                {event.title}
              </Text>
              {event.description && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5 leading-4" numberOfLines={2}>
                  {event.description}
                </Text>
              )}
            </View>
            <View className="items-end flex-shrink-0">
              <View className={[
                'rounded-lg px-2 py-0.5',
                isUrgent ? 'bg-orange-500/15' :
                isMed    ? 'bg-primary/13' :
                           'bg-brand-teal/10',
              ].join(' ')}>
                <Text className={[
                  'text-xs font-bold',
                  isUrgent ? 'text-orange-400' :
                  isMed    ? 'text-primary' :
                             'text-brand-teal',
                ].join(' ')}>
                  {event.daysUntil === 0 ? 'Today' :
                   event.daysUntil === 1 ? 'Tomorrow' :
                   `${event.daysUntil}d`}
                </Text>
              </View>
              {isConsultation && event.meetingMethod && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
                  {event.meetingMethod === 'phone' ? '📞' :
                   event.meetingMethod === 'video' ? '💻' : '📍'}
                </Text>
              )}
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function UpcomingEventsSection({ events }: { events: UpcomingEvent[] }) {
  if (events.length === 0) return null;
  return (
    <Animated.View entering={FadeInDown.delay(300).springify()} className="mb-3.5">
      <SectionHeader title="📅 Upcoming" action="All" onAction={() => router.push('/(app)/more/consultations' as any)} />
      <View className="bg-card rounded-card p-4 border border-border">
        {events.map((ev, i) => (
          <EventItem key={i} event={ev} isLast={i === events.length - 1} />
        ))}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// RECENT ACTIVITY
// ─────────────────────────────────────────────────────────────────

const ACTIVITY_ROUTES: Record<string, string> = {
  switch:               '/(app)/more/switches',
  consultation:         '/(app)/more/consultations',
  consultation_payment: '/(app)/more/consultations',
  meter:                '/(app)/more/meter-readings',
  document:             '/(app)/documents',
  quote:                '/(app)/quotes',
};

const STATUS_COLORS: Record<string, string> = {
  completed:         'text-brand-teal',
  signed:            'text-brand-teal',
  fulfilled:         'text-brand-teal',
  cancelled:         'text-[#4A6A82]',
  failed:            'text-destructive',
  objected:          'text-orange-400',
  processing:        'text-orange-400',
  awaiting_payment:  'text-orange-400',
};

function ActivityRow({ item, isLast }: { item: ActivityItem; isLast: boolean }) {
  const statusColor = STATUS_COLORS[item.status] ?? 'text-primary';
  const route = item.id
    ? `${ACTIVITY_ROUTES[item.type] ?? '/(app)'}/${item.id}`
    : (ACTIVITY_ROUTES[item.type] ?? '/(app)');

  return (
    <Pressable onPress={() => router.push(route as any)}>
      <View className={[
        'flex-row items-start gap-3 py-2.5',
        !isLast ? 'border-b border-border' : '',
      ].join(' ')}>
        {/* Icon bubble */}
        <View className="w-9 h-9 rounded-xl bg-primary/8 border border-primary/15 items-center justify-center flex-shrink-0">
          <Text style={{ fontSize: 16 }}>{item.icon}</Text>
        </View>

        {/* Content */}
        <View className="flex-1 min-w-0">
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg leading-5" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className={`text-xs font-sans leading-4 mt-0.5 ${statusColor}`} numberOfLines={2}>
            {item.description}
          </Text>
          {item.reference && (
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
              {item.reference}
            </Text>
          )}
        </View>

        {/* Time */}
        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-shrink-0 mt-0.5">
          {fmt.timeAgo(item.timestamp)}
        </Text>
      </View>
    </Pressable>
  );
}

function RecentActivitySection({ activity }: { activity: ActivityItem[] }) {
  const [showAll, setShowAll] = React.useState(false);
  if (activity.length === 0) return null;

  const visible = showAll ? activity : activity.slice(0, 5);

  return (
    <Animated.View entering={FadeInDown.delay(340).springify()} className="mb-3.5">
      <SectionHeader title="🕐 Recent Activity" />
      <View className="bg-card rounded-card px-4 py-1 border border-border">
        {visible.map((item, i) => (
          <ActivityRow key={`${item.type}-${i}`} item={item} isLast={i === visible.length - 1} />
        ))}
      </View>
      {activity.length > 5 && (
        <Pressable
          onPress={() => setShowAll((p) => !p)}
          className="bg-card border border-border rounded-banner h-9 items-center justify-center mt-2"
        >
          <Text className="text-xs font-semibold text-[#4A6A82] dark:text-brand-fg-muted">
            {showAll ? 'Show less ▲' : `View all ${activity.length} events ▼`}
          </Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// ENERGY SNAPSHOT
// ─────────────────────────────────────────────────────────────────

function EnergySnapshotSection({
  snapshot, latestReading,
}: {
  snapshot:      EnergySnapshot;
  latestReading: LatestMeterReading | null;
}) {
  const hasData =
    snapshot.mpan || snapshot.mprn ||
    snapshot.currentElecSupplier || snapshot.currentGasSupplier;

  if (!hasData) return null;

  const formatContract = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d    = new Date(dateStr);
    const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return 'Expired';
    if (days <= 30) return `Renews in ${days}d ⚠️`;
    return fmt.date(dateStr);
  };

  return (
    <Animated.View entering={FadeInDown.delay(380).springify()} className="mb-3.5">
      <SectionHeader
        title="⚡ Your Energy"
        action="Edit"
        onAction={() => router.push('/(profile-setup)/step-4' as any)}
      />
      <View className="bg-card rounded-card p-4 border border-border">

        {/* Meter IDs row */}
        {(snapshot.mpan || snapshot.mprn) && (
          <View className="flex-row gap-2 mb-3 flex-wrap">
            {snapshot.mpan && (
              <View className="bg-primary/8 border border-primary/15 rounded-xl px-3 py-2 flex-1">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-0.5">MPAN (Electricity)</Text>
                <Text className="text-sm font-bold text-brand dark:text-brand-fg" style={{ fontFamily: 'monospace' }}>
                  {snapshot.mpan}
                </Text>
              </View>
            )}
            {snapshot.mprn && (
              <View className="bg-orange-500/8 border border-orange-500/15 rounded-xl px-3 py-2 flex-1">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-0.5">MPRN (Gas)</Text>
                <Text className="text-sm font-bold text-brand dark:text-brand-fg" style={{ fontFamily: 'monospace' }}>
                  {snapshot.mprn}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Suppliers + tariff grid */}
        <View className="flex-row gap-2 mb-3 flex-wrap">
          {snapshot.currentElecSupplier && (
            <View className="flex-1 min-w-[130px]">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-0.5">⚡ Electricity supplier</Text>
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg">{snapshot.currentElecSupplier}</Text>
              {snapshot.elecTariffType && (
                <Text className="text-xs font-sans text-primary capitalize mt-0.5">{snapshot.elecTariffType}</Text>
              )}
              {snapshot.elecContractEnds && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
                  {formatContract(snapshot.elecContractEnds)}
                </Text>
              )}
            </View>
          )}
          {snapshot.currentGasSupplier && (
            <View className="flex-1 min-w-[130px]">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-0.5">🔥 Gas supplier</Text>
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg">{snapshot.currentGasSupplier}</Text>
              {snapshot.gasTariffType && (
                <Text className="text-xs font-sans text-orange-400 capitalize mt-0.5">{snapshot.gasTariffType}</Text>
              )}
              {snapshot.gasContractEnds && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
                  {formatContract(snapshot.gasContractEnds)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Annual usage row */}
        {(snapshot.annualElecKwh || snapshot.annualGasKwh) && (
          <View className="flex-row gap-2">
            {snapshot.annualElecKwh && (
              <View className="flex-1 bg-primary/6 dark:bg-brand-selected/20 rounded-xl p-2.5 items-center">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Annual electricity</Text>
                <Text className="text-base font-bold text-brand-blue-bright mt-0.5">
                  {fmt.kwh(snapshot.annualElecKwh)}
                </Text>
              </View>
            )}
            {snapshot.annualGasKwh && (
              <View className="flex-1 bg-orange-500/6 dark:bg-orange-500/8 rounded-xl p-2.5 items-center">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Annual gas</Text>
                <Text className="text-base font-bold text-orange-400 mt-0.5">
                  {fmt.kwh(snapshot.annualGasKwh)}
                </Text>
              </View>
            )}
            {snapshot.hasSmartMeter && (
              <View className="flex-1 bg-brand-teal/8 rounded-xl p-2.5 items-center border border-brand-teal/20">
                <Text style={{ fontSize: 18 }}>📡</Text>
                <Text className="text-xs font-bold text-brand-teal mt-0.5">Smart Meter</Text>
              </View>
            )}
          </View>
        )}

        {/* Latest meter data */}
        {latestReading && (
          <Pressable
            onPress={() => router.push(`/(app)/more/meter-readings/${latestReading._id}` as any)}
            className="mt-3 bg-brand-teal/8 border border-brand-teal/20 rounded-xl px-3 py-2.5 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2">
              <Text style={{ fontSize: 14 }}>📡</Text>
              <View>
                <Text className="text-xs font-bold text-brand-teal">Latest meter reading</Text>
                <Text className="text-xs font-sans text-brand-teal/80">
                  {latestReading.readingNumber} · {fmt.date(latestReading.fulfilledAt)}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-sans text-brand-teal">View →</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// QUICK STATS
// ─────────────────────────────────────────────────────────────────

function QuickStatsSection({ stats }: { stats: QuickStats }) {
  const items = [
    {
      label: 'Switches done',
      value: String(stats.switchesCompleted),
      sub:   'completed',
      icon:  '🔄',
      accent: 'blue',
    },
    {
      label: 'Total savings',
      value: stats.totalSavingsDelivered > 0 ? fmt.currency(stats.totalSavingsDelivered) : '—',
      sub:   'delivered',
      icon:  '💰',
      accent: 'teal',
    },
    {
      label: 'Sessions',
      value: String(stats.consultationsCompleted),
      sub:   'consultations',
      icon:  '💡',
      accent: 'blue',
    },
    {
      label: 'Docs signed',
      value: String(stats.documentsSignedCount),
      sub:   'documents',
      icon:  '✅',
      accent: 'teal',
    },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(420).springify()} className="mb-3.5">
      <SectionHeader title="🏆 Your Journey" />
      <View className="flex-row flex-wrap gap-2">
        {items.map((item) => (
          <View
            key={item.label}
            className="bg-card rounded-card p-3.5 border border-border"
            style={{ width: '48%' }}
          >
            <View className="flex-row items-center gap-2 mb-2">
              <Text style={{ fontSize: 20 }}>{item.icon}</Text>
            </View>
            <Text className={[
              'text-2xl font-bold',
              item.accent === 'teal' ? 'text-brand-teal' : 'text-primary',
            ].join(' ')}>
              {item.value}
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-0.5">
              {item.sub}
            </Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// EMPTY STATE — when no data at all
// ─────────────────────────────────────────────────────────────────

function WelcomeEmpty({ firstName }: { firstName: string }) {
  const steps = [
    { icon: '📋', text: 'Complete your profile', route: '/(profile-setup)/step-1' },
    { icon: '⚡', text: 'Add your meter numbers (MPAN/MPRN)', route: '/(profile-setup)/step-4' },
    { icon: '🔍', text: 'Compare tariffs', route: '/(app)/tariffs' },
    { icon: '📬', text: 'Request a quote', route: '/(app)/quotes/create' },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} className="mx-0 mb-4">
      <View
        className="bg-card rounded-card p-5 border border-border"
        style={{
          shadowColor: '#2272A6',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 4,
        }}
      >
        <View className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 items-center justify-center mb-4">
          <Text style={{ fontSize: 28 }}>⚡</Text>
        </View>
        <Text className="text-lg font-bold text-brand dark:text-brand-fg mb-1.5">
          Welcome, {firstName}!
        </Text>
        <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted leading-5 mb-4">
          Let's get started. Complete these steps to unlock your personalised energy dashboard.
        </Text>
        {steps.map((s, i) => (
          <Pressable key={s.text} onPress={() => router.push(s.route as any)}>
            <View className="flex-row items-center gap-3 py-2.5 border-b border-border last:border-0">
              <View className="w-8 h-8 rounded-xl bg-primary/8 items-center justify-center flex-shrink-0">
                <Text style={{ fontSize: 16 }}>{s.icon}</Text>
              </View>
              <Text className="text-sm font-sans flex-1 text-brand dark:text-brand-fg">{s.text}</Text>
              <Text className="text-xs font-semibold text-primary">→</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────

function DashboardHeader({
  firstName,
  greeting,
  completionPercent,
  highPriorityAlerts,
  onLogout,
}: {
  firstName:         string;
  greeting:          string;
  completionPercent: number;
  highPriorityAlerts: number;
  onLogout:          () => void;
}) {
  return (
    <View className="bg-brand pt-14 pb-5 px-5">

      {/* Top row — greeting + actions */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-1">
          <Text className="text-xs font-sans text-brand-fg-muted mb-0.5" style={{ letterSpacing: 0.5 }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
          <Text className="text-2xl font-bold text-brand-fg leading-8">{greeting}</Text>
        </View>

        {/* Right side buttons */}
        <View className="flex-row items-center gap-2">
          {/* Alerts bell */}
          {highPriorityAlerts > 0 && (
            <Pressable
              onPress={() => router.push('/(app)/documents' as any)}
              className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/25 items-center justify-center"
            >
              <Text style={{ fontSize: 16 }}>🔔</Text>
              {/* Badge */}
              <View
                className="absolute -top-1 -right-1 bg-destructive rounded-full items-center justify-center"
                style={{ width: 16, height: 16 }}
              >
                <Text style={{ color: '#fff', fontSize: 8, fontWeight: '700' }}>
                  {highPriorityAlerts > 9 ? '9+' : String(highPriorityAlerts)}
                </Text>
              </View>
            </Pressable>
          )}

          {/* Profile completion ring / logout */}
          <Pressable onPress={onLogout} hitSlop={8}>
            <CompletionRing percent={completionPercent} />
          </Pressable>
        </View>
      </View>

      {/* Profile completion hint */}
      {completionPercent < 100 && (
        <Pressable
          onPress={() => router.push('/(profile-setup)/step-1' as any)}
          className="bg-primary/15 border border-primary/25 rounded-xl px-3 py-2 flex-row items-center gap-2"
        >
          <View className="flex-1">
            <View className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary rounded-full"
                style={{ width: `${completionPercent}%` }}
              />
            </View>
          </View>
          <Text className="text-xs font-sans text-brand-fg-muted flex-shrink-0">
            Profile {completionPercent}% — tap to complete
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { user, logout }                 = useAuthStore();
  const { dashboard, isLoading, isRefreshing, loadDashboard, refreshDashboard } =
    useDashboardStore();

  const { colorScheme } = useColorScheme();

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    import('react-native').then(({ Alert }) => {
      Alert.alert('Sign out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out', style: 'destructive', onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]);
    });
  };

  // ── Loading skeleton ──────────────────────────────────────────
  if (isLoading && !dashboard) {
    return (
      <View className="flex-1 bg-background">
        <View className="bg-brand pt-14 pb-5 px-5">
          <View className="h-6 w-40 bg-primary/20 rounded-lg mb-2" />
          <View className="h-8 w-56 bg-primary/20 rounded-lg" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
          <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-3">
            Loading your dashboard…
          </Text>
        </View>
      </View>
    );
  }

  const d = dashboard;
  const firstName = d?.greeting.firstName ?? user?.firstName ?? '';
  const greetingMsg = d?.greeting.message ?? `Hello, ${firstName}!`;

  // ── Has no real data yet ──────────────────────────────────────
  const hasActivity = (d?.pipeline.quotes.total ?? 0) +
                      (d?.pipeline.switches.total ?? 0) +
                      (d?.pipeline.documents.total ?? 0) +
                      (d?.pipeline.consultations.total ?? 0) > 0;

  return (
    <View className="flex-1 bg-background">

      <DashboardHeader
        firstName={firstName}
        greeting={greetingMsg}
        completionPercent={d?.profile.completionPercent ?? 0}
        highPriorityAlerts={d?.summary.highPriorityAlerts ?? 0}
        onLogout={handleLogout}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshDashboard}
            tintColor="#2272A6"
          />
        }
      >

        {/* ── No activity yet — welcome state ── */}
        {!hasActivity && !isLoading && (
          <WelcomeEmpty firstName={firstName} />
        )}

        {/* ── Savings potential hero ── */}
        {d?.savingsPotential && (d.savingsPotential.potentialSaving ?? 0) > 0 && (
          <SavingsHero data={d.savingsPotential} />
        )}

        {/* ── Summary chips ── */}
        {d?.summary && (
          <SummaryChipRow summary={d.summary} />
        )}

        {/* ── Smart alerts ── */}
        {d?.alerts && d.alerts.length > 0 && (
          <AlertsSection alerts={d.alerts} />
        )}

        {/* ── Active switch ── */}
        {d?.activeSwitch && (
          <ActiveSwitchCard sw={d.activeSwitch} />
        )}

        {/* ── Pipeline overview ── */}
        {d?.pipeline && hasActivity && (
          <PipelineOverview pipeline={d.pipeline} />
        )}

        {/* ── Upcoming events ── */}
        {d?.upcomingEvents && d.upcomingEvents.length > 0 && (
          <UpcomingEventsSection events={d.upcomingEvents} />
        )}

        {/* ── Recent activity ── */}
        {d?.recentActivity && d.recentActivity.length > 0 && (
          <RecentActivitySection activity={d.recentActivity} />
        )}

        {/* ── Energy snapshot ── */}
        {d?.energySnapshot && (
          <EnergySnapshotSection
            snapshot={d.energySnapshot}
            latestReading={d.latestMeterReading}
          />
        )}

        {/* ── Quick stats ── */}
        {d?.quickStats && (
          (d.quickStats.switchesCompleted > 0 ||
           d.quickStats.consultationsCompleted > 0 ||
           d.quickStats.documentsSignedCount > 0) && (
          <QuickStatsSection stats={d.quickStats} />
        ))}

        {/* ── Quick actions row (always visible) ── */}
        <Animated.View entering={FadeInDown.delay(460).springify()} className="mb-3.5">
          <SectionHeader title="🚀 Quick Actions" />
          <View className="flex-row flex-wrap gap-2">
            {[
              { icon: '🔍', label: 'Compare Tariffs', route: '/(app)/tariffs', color: 'bg-primary' },
              { icon: '📬', label: 'Request Quote',   route: '/(app)/quotes/create', color: 'bg-primary' },
              { icon: '📡', label: 'Meter Data',      route: '/(app)/more/meter-readings/request', color: 'bg-primary' },
              { icon: '💡', label: 'Book Session',    route: '/(app)/more/consultations/book', color: 'bg-primary' },
            ].map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={{ width: '48%' }}
              >
                <View className="bg-card border border-border rounded-card p-3.5 flex-row items-center gap-2.5">
                  <View className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 items-center justify-center flex-shrink-0">
                    <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  </View>
                  <Text className="text-sm font-semibold text-brand dark:text-brand-fg flex-1" numberOfLines={2}>
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ── Footer ── */}
        <View className="items-center py-3">
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            Energy Broker · Pull to refresh
            {d?.meta.generatedAt
              ? `  ·  Updated ${fmt.timeAgo(d.meta.generatedAt)}`
              : ''}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}