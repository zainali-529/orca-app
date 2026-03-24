import { Text } from '@/components/ui/text';
import { useConsultationStore } from '@/lib/store/consultation.store';
import type { Consultation, ConsultationStatus } from '@/lib/types/consultation.types';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator, FlatList, Pressable, RefreshControl, View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CFG: Record<ConsultationStatus, {
  label: string; emoji: string; bgClass: string; textClass: string;
}> = {
  requested:          { label: 'Pending',          emoji: '📋', bgClass: 'bg-primary/13',          textClass: 'text-primary'                               },
  awaiting_payment:   { label: 'Awaiting Payment', emoji: '💳', bgClass: 'bg-orange-500/10',        textClass: 'text-orange-400'                            },
  payment_failed:     { label: 'Payment Failed',   emoji: '❌', bgClass: 'bg-destructive/8',        textClass: 'text-destructive'                           },
  payment_confirmed:  { label: 'Payment Done',     emoji: '✅', bgClass: 'bg-brand-teal/8',         textClass: 'text-brand-teal'                            },
  confirmed:          { label: 'Confirmed',        emoji: '✅', bgClass: 'bg-brand-teal/8',         textClass: 'text-brand-teal'                            },
  scheduled:          { label: 'Scheduled',        emoji: '📅', bgClass: 'bg-brand-blue-bright/10', textClass: 'text-brand-blue-bright'                     },
  in_progress:        { label: 'In Progress',      emoji: '🎙️', bgClass: 'bg-primary/13',           textClass: 'text-primary'                               },
  completed:          { label: 'Completed',        emoji: '✅', bgClass: 'bg-brand-teal/8',         textClass: 'text-brand-teal'                            },
  cancelled:          { label: 'Cancelled',        emoji: '❌', bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted' },
  no_show:            { label: 'No Show',          emoji: '⚠️', bgClass: 'bg-orange-500/10',        textClass: 'text-orange-400'                            },
  refunded:           { label: 'Refunded',         emoji: '💰', bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted' },
};

const CATEGORY_LABELS: Record<string, string> = {
  general:         '💡 General',
  tariff_review:   '📊 Tariff Review',
  switch_advice:   '🔄 Switch Advice',
  contract_review: '📋 Contract Review',
  energy_audit:    '🔍 Energy Audit',
  renewal_advice:  '📅 Renewal Advice',
  new_connection:  '🏢 New Connection',
};

const FILTER_TABS: { id: ConsultationStatus | 'all'; label: string }[] = [
  { id: 'all',              label: 'All'       },
  { id: 'awaiting_payment', label: 'Payment'   },
  { id: 'scheduled',        label: 'Upcoming'  },
  { id: 'completed',        label: 'Done'      },
  { id: 'cancelled',        label: 'Cancelled' },
];

// ─── Consultation card ─────────────────────────────────────────────

function ConsultationCard({ item }: { item: Consultation }) {
  const cfg      = STATUS_CFG[item.status];
  const isPay    = item.status === 'awaiting_payment';
  const isFailed = item.status === 'payment_failed';
  const isUpcoming = item.status === 'scheduled' && item.scheduledAt;

  const date = new Date(item.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <Pressable onPress={() => router.push(`/(app)/more/consultations/${item._id}` as any)}>
      <View className={[
        'bg-card rounded-card p-4 mb-2.5 border',
        isPay    ? 'border-orange-500/30' :
        isFailed ? 'border-destructive/25' :
        item.status === 'scheduled' ? 'border-brand-blue-bright/25' :
        item.status === 'completed' ? 'border-brand-teal/25' :
        'border-border',
      ].join(' ')}>

        {/* Top row */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2 flex-1 flex-wrap mr-2">
            <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${cfg.bgClass}`}>
              <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                {cfg.emoji} {cfg.label}
              </Text>
            </View>
            <View className="bg-primary/6 dark:bg-brand-selected rounded-md px-1.5 py-0.5">
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {CATEGORY_LABELS[item.category] ?? item.category}
              </Text>
            </View>
          </View>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-shrink-0">
            {date}
          </Text>
        </View>

        {/* Title + duration + price */}
        <View className="flex-row items-center justify-between mb-1.5">
          <Text className="text-base font-bold text-brand dark:text-brand-fg flex-1 mr-3" numberOfLines={1}>
            {item.label ?? `${item.duration} min consultation`}
          </Text>
          <Text className="text-base font-bold text-primary flex-shrink-0">
            £{item.price}
          </Text>
        </View>

        <View className="flex-row items-center gap-1.5 mb-2">
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            {item.duration} min ·{' '}
            {item.meetingMethod === 'phone' ? '📞 Phone' : item.meetingMethod === 'video' ? '💻 Video' : '📍 In Person'}
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            · {item.consultationNumber}
          </Text>
        </View>

        {/* Upcoming scheduled time */}
        {isUpcoming && (
          <View className="bg-brand-blue-bright/10 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5">
            <Text className="text-xs font-semibold text-brand-blue-bright">
              📅 {new Date(item.scheduledAt!).toLocaleDateString('en-GB', {
                weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
              })}
            </Text>
          </View>
        )}

        {/* Payment needed CTA */}
        {isPay && (
          <View className="bg-orange-500/10 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5 mt-1">
            <Text className="text-xs font-semibold text-orange-400">
              💳 Payment required — tap to complete
            </Text>
          </View>
        )}

        {/* Payment failed */}
        {isFailed && (
          <View className="bg-destructive/8 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5 mt-1">
            <Text className="text-xs font-semibold text-destructive">
              ❌ Payment failed — tap to retry
            </Text>
          </View>
        )}

        {/* Rating prompt */}
        {item.status === 'completed' && !item.rating && (
          <View className="bg-brand-teal/8 rounded-lg px-2.5 py-1.5 flex-row items-center gap-1.5 mt-1">
            <Text className="text-xs font-semibold text-brand-teal">⭐ Leave a rating</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Empty state ───────────────────────────────────────────────────

function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20 mb-4">
        <Text style={{ fontSize: 32 }}>💡</Text>
      </View>
      <Text className="text-base font-bold text-brand dark:text-brand-fg text-center mb-2">
        No consultations yet
      </Text>
      <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted mb-5">
        Book a session with our energy experts. We'll review your tariffs, contracts, and find you the best deals.
      </Text>
      <Pressable
        onPress={() => router.push('/(app)/more/consultations/book' as any)}
        className="bg-primary rounded-card px-6 py-3"
      >
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
          Book a Consultation
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
          router.push('/(app)/more/consultations/book' as any);
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
          Book Consultation
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function ConsultationsIndexScreen() {
  const { consultations, pagination, summary, isLoadingList, loadConsultations, loadSummary } =
    useConsultationStore();

  const [activeFilter, setActiveFilter] = React.useState<ConsultationStatus | 'all'>('all');
  const [refreshing,   setRefreshing]   = React.useState(false);

  const fetch = React.useCallback((f: ConsultationStatus | 'all' = activeFilter) =>
    loadConsultations(f === 'all' ? { limit: 30 } : { status: f, limit: 30 }),
    [activeFilter]
  );

  React.useEffect(() => {
    fetch();
    loadSummary();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetch(), loadSummary()]);
    setRefreshing(false);
  };

  const handleFilter = (f: ConsultationStatus | 'all') => {
    setActiveFilter(f);
    loadConsultations(f === 'all' ? { limit: 30 } : { status: f, limit: 30 });
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-4 px-5">

        <View className="flex-row items-center justify-between mb-3">
          <View>
            <Text className="text-xl font-bold text-brand-fg">Consultations</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {pagination
                ? `${pagination.total} session${pagination.total !== 1 ? 's' : ''}`
                : 'Expert energy advice'}
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
            {summary.upcoming > 0 && (
              <View className="bg-brand-blue-bright/10 border border-brand-blue-bright/20 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-blue-bright">{summary.upcoming}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Upcoming</Text>
              </View>
            )}
            {summary.completed > 0 && (
              <View className="bg-brand-teal/10 border border-brand-teal/20 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-brand-teal">{summary.completed}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Completed</Text>
              </View>
            )}
            {summary.awaiting_payment > 0 && (
              <View className="bg-orange-500/15 border border-orange-500/25 rounded-xl px-3 py-2 items-center">
                <Text className="text-base font-bold text-orange-400">{summary.awaiting_payment}</Text>
                <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">Pay Now</Text>
              </View>
            )}
          </View>
        )}

        {/* Info strip */}
        <View className="bg-primary/13 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-primary/20">
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text className="text-xs font-sans flex-1 leading-4 text-brand-fg-muted">
            Expert 1-on-1 sessions with our energy advisors. Tariff reviews, switching advice, contract help and more.
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
                  className={['text-xs',
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
      {isLoadingList && consultations.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={consultations}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <ConsultationCard item={item} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 80, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2272A6" />
          }
          ListEmptyComponent={<EmptyState />}
        />
      )}

      <FAB />
    </View>
  );
}