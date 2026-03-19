import { Text } from '@/components/ui/text';
import { useQuoteStore } from '@/lib/store/quote.store';
import type { QuoteRequest, QuoteRequestStatus } from '@/lib/types/quote.types';
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
import Svg, { Path } from 'react-native-svg';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QuoteRequestStatus, {
  label: string; emoji: string;
  bgClass: string; textClass: string;
}> = {
  pending:   { label: 'Pending',   emoji: '⏳', bgClass: 'bg-primary/13',   textClass: 'text-primary' },
  contacted: { label: 'Contacted', emoji: '📞', bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal' },
  completed: { label: 'Completed', emoji: '✅', bgClass: 'bg-brand-green/10', textClass: 'text-brand-green' },
  cancelled: { label: 'Cancelled', emoji: '❌', bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted' },
};

// ─── Filter tabs ──────────────────────────────────────────────────────────────

const FILTER_TABS: { id: QuoteRequestStatus | 'all'; label: string }[] = [
  { id: 'all',       label: 'All'       },
  { id: 'pending',   label: 'Pending'   },
  { id: 'contacted', label: 'Contacted' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

// ─── Summary pill ─────────────────────────────────────────────────────────────

function SummaryPill({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View
      className={[
        'items-center px-3 py-2 rounded-xl border',
        accent
          ? 'bg-brand-teal/10 border-brand-teal/20'
          : 'bg-primary/10 border-primary/20',
      ].join(' ')}
    >
      <Text className={`text-base font-bold ${accent ? 'text-brand-teal' : 'text-brand-fg'}`}>
        {value}
      </Text>
      <Text className="text-xs font-sans text-brand-fg-muted mt-0.5">{label}</Text>
    </View>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QuoteRequestStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${cfg.bgClass}`}>
      <Text className={`text-xs font-semibold ${cfg.textClass}`}>
        {cfg.emoji} {cfg.label}
      </Text>
    </View>
  );
}

// ─── Quote card ───────────────────────────────────────────────────────────────

function QuoteCard({ quote }: { quote: QuoteRequest }) {
  const date = new Date(quote.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  const hasTariff = !!quote.interestedTariff?.supplier;
  const hasEstimate = !!quote.interestedTariff?.estimatedAnnualCost;
  const hasSaving = typeof quote.interestedTariff?.estimatedAnnualSaving === 'number'
    && (quote.interestedTariff.estimatedAnnualSaving ?? 0) > 0;

  return (
    <Pressable onPress={() => router.push(`/(app)/quotes/${quote._id}` as any)}>
      <View className="bg-card rounded-card p-4 mb-2.5 border border-border">

        {/* ── Top row ── */}
        <View className="flex-row items-center justify-between mb-2.5">
          <View className="flex-row items-center gap-2">
            <Text className="text-xs font-bold text-primary">{quote.quoteNumber}</Text>
            <StatusBadge status={quote.status} />
          </View>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">{date}</Text>
        </View>

        {/* ── Tariff info (if interested in specific tariff) ── */}
        {hasTariff ? (
          <View className="mb-2.5">
            <View className="flex-row items-center gap-1.5 mb-0.5">
              <Text className="text-base font-semibold text-brand dark:text-brand-fg" numberOfLines={1}>
                {quote.interestedTariff.supplier}
              </Text>
              {quote.interestedTariff.isGreen && <Text className="text-xs">🌿</Text>}
            </View>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted" numberOfLines={1}>
              {quote.interestedTariff.tariffName}
            </Text>
          </View>
        ) : (
          <Text className="text-base font-semibold text-brand dark:text-brand-fg mb-2.5">
            General Quote Request
          </Text>
        )}

        {/* ── Cost estimate + saving ── */}
        {(hasEstimate || hasSaving) && (
          <View className="flex-row items-center justify-between pt-2.5 border-t border-border">
            {hasEstimate && (
              <View>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Est. annual</Text>
                <Text className="text-base font-bold text-brand dark:text-brand-fg">
                  £{quote.interestedTariff.estimatedAnnualCost!.toLocaleString()}
                </Text>
              </View>
            )}
            {hasSaving && (
              <View className="items-end">
                <Text className="text-xs font-sans text-brand-teal">Est. saving</Text>
                <Text className="text-base font-bold text-brand-teal">
                  £{Math.round(quote.interestedTariff.estimatedAnnualSaving!).toLocaleString()}/yr
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ── Energy snapshot hints ── */}
        {!hasTariff && (
          <View className="flex-row gap-2 mt-1">
            {quote.energySnapshot?.currentElectricitySupplier && (
              <View className="bg-primary/6 dark:bg-brand rounded-lg px-2 py-1">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  ⚡ {quote.energySnapshot.currentElectricitySupplier}
                </Text>
              </View>
            )}
            {quote.preferences?.preferGreen && (
              <View className="bg-brand-teal/8 rounded-lg px-2 py-1">
                <Text className="text-xs font-sans text-brand-teal">🌿 Green</Text>
              </View>
            )}
          </View>
        )}

        {/* ── Message preview ── */}
        {quote.message && (
          <Text
            className="text-xs font-sans mt-2 leading-4 text-[#4A6A82] dark:text-brand-fg-muted"
            numberOfLines={2}
          >
            "{quote.message}"
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ filter }: { filter: string }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-16 h-16 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20 mb-4">
        <Svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
            stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          />
          <Path
            d="M14 2v6h6M12 18v-6M9 15h6"
            stroke="#2272A6" strokeWidth="2" strokeLinecap="round"
          />
        </Svg>
      </View>
      <Text className="text-base font-bold text-brand dark:text-brand-fg text-center mb-1">
        {filter === 'all' ? 'No quote requests yet' : `No ${filter} requests`}
      </Text>
      <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
        {filter === 'all'
          ? 'Compare tariffs and request a quote — our team will contact you.'
          : `You have no ${filter} quote requests.`}
      </Text>
    </View>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

function FAB() {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle} className="absolute bottom-6 right-5">
      <Pressable
        onPress={() => {
          scale.value = withSpring(0.92, { damping: 12 }, () => {
            scale.value = withSpring(1, { damping: 14 });
          });
          router.push('/(app)/quotes/create' as any);
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
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Request Quote</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuotesIndexScreen() {
  const { quotes, pagination, summary, isLoadingList, loadQuotes, loadSummary } = useQuoteStore();
  const [activeFilter, setActiveFilter] = React.useState<QuoteRequestStatus | 'all'>('all');
  const [refreshing,   setRefreshing]   = React.useState(false);

  const fetch = React.useCallback(async (filter: QuoteRequestStatus | 'all' = activeFilter) => {
    await Promise.all([
      loadQuotes(filter === 'all' ? { limit: 30 } : { status: filter, limit: 30 }),
      loadSummary(),
    ]);
  }, [activeFilter]);

  React.useEffect(() => { fetch(); }, []);

  const handleFilter = (f: QuoteRequestStatus | 'all') => {
    setActiveFilter(f);
    loadQuotes(f === 'all' ? { limit: 30 } : { status: f, limit: 30 });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetch();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header — always brand navy ─── */}
      <View className="bg-brand pt-14 pb-4 px-5">

        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xl font-bold text-brand-fg">My Quotes</Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {pagination
                ? `${pagination.total} request${pagination.total !== 1 ? 's' : ''} total`
                : 'Your energy quote requests'}
            </Text>
          </View>
        </View>

        {/* Summary strip */}
        {summary && (
          <View className="flex-row gap-2.5 mb-4">
            <SummaryPill label="Pending"   value={summary.pending} />
            <SummaryPill label="Contacted" value={summary.contacted} />
            <SummaryPill label="Completed" value={summary.completed} accent />
          </View>
        )}

        {/* Info banner */}
        <View className="bg-primary/13 rounded-xl px-3 py-2.5 mb-3 flex-row items-start gap-2 border border-primary/20">
          <Text style={{ fontSize: 14 }}>ℹ️</Text>
          <Text className="text-xs font-sans flex-1 leading-4 text-brand-fg-muted">
            After you request a quote, our team will contact you via your preferred method to finalise your switch.
          </Text>
        </View>

        {/* Filter tabs */}
        <View className="flex-row -mb-1">
          {FILTER_TABS.map((tab) => {
            const isActive = activeFilter === tab.id;
            const count = summary && tab.id !== 'all'
              ? summary[tab.id as QuoteRequestStatus]
              : undefined;
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
                  {tab.label}{count !== undefined && count > 0 ? ` (${count})` : ''}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 h-0.5 w-4/5 bg-brand-blue-bright rounded-sm" />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Content ─── */}
      {isLoadingList && quotes.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={quotes}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => <QuoteCard quote={item} />}
          contentContainerStyle={{ padding: 14, paddingBottom: 120, flexGrow: 1 }}
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