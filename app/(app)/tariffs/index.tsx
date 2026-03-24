import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { useTariffStore } from '@/lib/store/tariff.store';
import type { EnrichedTariff } from '@/lib/types/tariff.types';
import { router } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const FUEL_TYPES   = [{ id: 'dual', label: '⚡🔥 Dual' }, { id: 'electricity', label: '⚡ Electricity' }, { id: 'gas', label: '🔥 Gas' }];
const TARIFF_TYPES = [{ id: 'any', label: 'All' }, { id: 'fixed', label: 'Fixed' }, { id: 'variable', label: 'Variable' }, { id: 'flexible', label: 'Flexible' }];

const TOP_TABS = [
  { id: 'compare',   label: 'Compare',    route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',     route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers',  route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator', route: '/(app)/tariffs/calculate' },
];

// ─── Top nav tabs ─────────────────────────────────────────────────────────────
// isDark removed — header bg is always brand navy in both modes

function TopTabs({ active }: { active: string }) {
  return (
    // bg-brand = #0D2C40 — fixed dark navy regardless of mode
    <View className="flex-row bg-brand px-4">
      {TOP_TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => router.push(tab.route as any)}
          // py-2.5 = 10px  (Tailwind default)
          className="flex-1 items-center py-2.5"
        >
          <Text
            className={[
              'text-xs',
              active === tab.id
                ? 'text-brand-fg font-semibold'
                : 'text-brand-fg-muted font-sans',
            ].join(' ')}
          >
            {tab.label}
          </Text>
          {active === tab.id && (
            // h-0.5 = 2px, w-4/5 = 80%
            // bg-brand-blue-bright = #3D9DD4  (config › brand.blue-bright)
            <View className="absolute bottom-0 h-0.5 w-4/5 bg-brand-blue-bright rounded-sm" />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ label, active, onPress }: {
  label: string; active: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      {/* px-3.5 = 14px, py-1.5 = 6px  (closest steps to original 13px/7px) */}
      <View
        className={[
          'px-3.5 py-1.5 rounded-full border',
          active
            ? 'border-primary bg-primary/7 dark:bg-brand-/20'
            : 'border-border bg-card',
        ].join(' ')}
      >
        {/* text-xs = 12px  (config › fontSize.xs) */}
        <Text
          className={[
            'text-xs font-sans',
            active ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted',
          ].join(' ')}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Best deal banner ─────────────────────────────────────────────────────────

function BestDealBanner({ bestDeal }: { bestDeal: any }) {
  const scale = useSharedValue(0.95);
  React.useEffect(() => { scale.value = withSpring(1, { damping: 14 }); }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (!bestDeal) return null;

  return (
    <Animated.View style={animStyle}>
      {/* rounded-2xl, border 1.5 — style prop (no Tailwind step for 1.5)
          bg-primary/7 light tint, dark:bg-brand-selected = #1A3A54        */}
      <View
        className="rounded-2xl p-4 mb-3.5 bg-primary/7 dark:bg-brand-selected/20 border-primary"
        style={{ borderWidth: 1.5 }}
      >
        {/* Title row */}
        <View className="flex-row items-center gap-2 mb-2">
          {/* p-1 = 4px */}
          <View className="bg-primary rounded-md p-1">
            <Text style={{ fontSize: 12 }}>⭐</Text>
          </View>
          {/* text-sm = 13px  (config › fontSize.13) */}
          <Text className="text-sm font-bold text-primary">
            Best Deal Found
          </Text>
        </View>

        {/* Supplier + tariff name */}
        {/* text-base = 16px  (config › fontSize.base) */}
        <Text className="text-base font-bold text-brand dark:text-brand-fg">
          {bestDeal.supplier}
        </Text>
        <Text className="text-sm font-sans mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">
          {bestDeal.tariffName}
        </Text>

        {/* Cost / saving row */}
        <View className="flex-row justify-between mt-3 pt-2.5 border-t border-primary/20">
          <View>
            {/* text-xs = 11px  (config › fontSize.11) */}
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Annual cost
            </Text>
            {/* text-lg = 18px  (config › fontSize.lg) */}
            <Text className="text-lg font-bold text-brand dark:text-brand-fg">
              £{bestDeal.annualCost?.toLocaleString()}
            </Text>
          </View>
          {bestDeal.annualSaving > 0 && (
            <View className="items-end">
              {/* text-brand-teal = #2DD4A0  (config › brand.teal) */}
              <Text className="text-xs font-sans text-brand-teal">You save</Text>
              <Text className="text-lg font-bold text-brand-teal">
                £{Math.round(bestDeal.annualSaving).toLocaleString()}/yr
              </Text>
            </View>
          )}
        </View>

        {/* CTA button
            rounded-banner = 10px  (config › borderRadius.banner) */}
        <Pressable
          onPress={() => router.push(`/(app)/tariffs/${bestDeal.tariffId}` as any)}
          className="mt-3 bg-primary rounded-banner py-2.5 items-center"
        >
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
            View This Deal
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─── Tariff card ──────────────────────────────────────────────────────────────

function TariffCard({ tariff, rank }: { tariff: EnrichedTariff; rank: number }) {
  const saving = tariff.calculated?.annualSaving;
  const isChp  = saving !== null && saving !== undefined && saving > 0;

  return (
    <Pressable onPress={() => router.push(`/(app)/tariffs/${tariff._id}` as any)}>
      {/* rounded-card = 14px  (config › borderRadius.card)
          mb-2.5 = 10px  (Tailwind default)
          isChp → primary/30 border, else theme border                    */}
      <View
        className={[
          'bg-card rounded-card p-4 mb-2.5 border',
          isChp ? 'border-primary/30' : 'border-border',
        ].join(' ')}
      >

        {/* ── Header row ───────────────────────────────────────────── */}
        <View className="flex-row items-start justify-between mb-2.5">
          <View className="flex-1 gap-1">
            <View className="flex-row items-center gap-2 flex-wrap">

              {/* Rank circle — w-5.5 h-5.5 = 22px  (config › spacing.5.5) */}
              <View
                className={[
                  'w-5.5 h-5.5 rounded-full items-center justify-center',
                  rank === 1 ? 'bg-primary' : 'bg-muted dark:bg-border/20',
                ].join(' ')}
              >
                {/* text-xs = 10px  (config › fontSize.10) */}
                <Text
                  className={[
                    'text-xs font-bold',
                    rank === 1
                      ? 'text-white'
                      : 'text-[#4A6A82] dark:text-brand-fg-muted',
                  ].join(' ')}
                >
                  {rank}
                </Text>
              </View>

              {/* Supplier name — text-base  (config › fontSize.15) */}
              <Text className="text-base font-semibold text-brand dark:text-brand-fg">
                {tariff.supplier}
              </Text>

              {/* LIVE badge
                  bg-brand-teal/8 = teal at 8% opacity  (config › opacity.8 + brand.teal) */}
              {tariff.isLive && (
                <View className="bg-brand-teal/8 rounded-md px-1.5 py-1 border border-brand-teal/20">
                  <Text className="text-xs font-bold text-brand-teal">● LIVE</Text>
                </View>
              )}

              {/* Green indicator — text-xs  (config › fontSize.11) */}
              {tariff.isGreen && (
                <Text className="text-xs">🌿</Text>
              )}
            </View>

            {/* Tariff name — text-sm  (config › fontSize.13) */}
            <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              {tariff.tariffName}
            </Text>
          </View>

          {/* Annual cost */}
          <View className="items-end">
            {tariff.calculated?.totalAnnualCost && (
              <>
                {/* text-lg = 18px  (config › fontSize.lg) */}
                <Text className="text-lg font-bold text-brand dark:text-brand-fg">
                  £{tariff.calculated.totalAnnualCost.toLocaleString()}
                </Text>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  per year
                </Text>
              </>
            )}
          </View>
        </View>

        {/* ── Rate boxes ───────────────────────────────────────────── */}
        {/* bg-primary/6 light, bg-brand dark  (config › opacity.6 + brand.DEFAULT) */}
        <View className="flex-row gap-2 mb-2.5">
          {tariff.electricity?.unitRate && (
            <View className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2 items-center">
              {/* text-sm = 14px, text-brand-blue-bright = #3D9DD4  (config › brand.blue-bright) */}
              <Text className="text-sm font-bold text-brand-blue-bright">
                {tariff.electricity.unitRate}
              </Text>
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                Elec/kWh
              </Text>
            </View>
          )}
          {tariff.gas?.unitRate && (
            <View className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2 items-center">
              <Text className="text-sm font-bold text-brand-blue-bright">
                {tariff.gas.unitRate}p
              </Text>
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                Gas/kWh
              </Text>
            </View>
          )}
          <View className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2 items-center">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg">
              {tariff.contractLengthMonths > 0 ? `${tariff.contractLengthMonths}m` : 'None'}
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Contract
            </Text>
          </View>
          <View className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2 items-center">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg">
              £{tariff.calculated?.monthlyCost ?? '—'}
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Monthly
            </Text>
          </View>
        </View>

        {/* ── Footer badges ─────────────────────────────────────────── */}
        <View className="flex-row items-center justify-between">
          <View className="flex-row gap-1.5 flex-1 flex-wrap">
            {tariff.cashback > 0 && (
              <View className="bg-brand-teal/8 rounded-md px-2 py-1 border border-brand-teal/20">
                <Text className="text-xs font-sans text-brand-teal">
                  £{tariff.cashback} cashback
                </Text>
              </View>
            )}
            {tariff.exitFee === 0 && (
              <View className="bg-primary/6 dark:bg-primary/10 rounded-md px-2 py-1">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  No exit fee
                </Text>
              </View>
            )}
          </View>
          {isChp && (
            // text-xs = 12px, text-brand-teal = #2DD4A0
            <Text className="text-xs font-bold text-brand-teal">
              Save £{Math.round(saving!).toLocaleString()}/yr
            </Text>
          )}
        </View>

      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TariffsCompareScreen() {
  const { comparison, isComparing, runComparison } = useTariffStore();
  const { profile } = useProfileStore();

  const [fuelType,   setFuelType]   = React.useState<'dual' | 'electricity' | 'gas'>('dual');
  const [tariffType, setTariffType] = React.useState('any');
  const [greenOnly,  setGreenOnly]  = React.useState(false);

  const handleCompare = async () => {
    try {
      await runComparison({
        fuelType,
        tariffType: tariffType as any,
        isGreen:    greenOnly || undefined,
        annualElectricityKwh:       profile?.energy?.annualElectricityKwh       ?? undefined,
        annualGasKwh:               profile?.energy?.annualGasKwh               ?? undefined,
        currentElectricitySupplier: profile?.energy?.currentElectricitySupplier ?? undefined,
        currentGasSupplier:         profile?.energy?.currentGasSupplier         ?? undefined,
        limit: 15,
      });
    } catch {}
  };

  React.useEffect(() => { handleCompare(); }, []);

  const tariffs = (comparison?.tariffs ?? []) as EnrichedTariff[];

  return (
    <View className="flex-1 bg-background">

      {/* ── Page header — always brand navy ──────────────────────────── */}
      {/* pt-14 = 56px  (Tailwind default › 14 × 4px) */}
      <View className="bg-brand pt-14">
        <View className="px-5 pb-3.5">
          {/* text-2xl = 22px  (config › fontSize.22) */}
          <Text className="text-2xl font-bold text-brand-fg">
            Tariffs
          </Text>
          {/* text-sm = 13px  (config › fontSize.13) */}
          <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
            {comparison
              ? `${tariffs.length} tariffs — cheapest first`
              : 'Compare UK energy tariffs'}
          </Text>
        </View>
        <TopTabs active="compare" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isComparing}
            onRefresh={handleCompare}
            tintColor="#2272A6"
          />
        }
      >

        {/* ── Filter card ──────────────────────────────────────────────
            rounded-card = 14px, p-3.5 = 14px  (config + Tailwind default) */}
        <View className="bg-card rounded-card p-3.5 border border-border mb-4 gap-3">

          {/* Fuel type chips */}
          <View>
            {/* text-xs = 10px, tracking-[0.5px] kept as arbitrary (no config step) */}
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted tracking-[0.5px] mb-2">
              FUEL TYPE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {FUEL_TYPES.map((f) => (
                  <Chip
                    key={f.id}
                    label={f.label}
                    active={fuelType === f.id}
                    onPress={() => setFuelType(f.id as any)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tariff type chips */}
          <View>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted tracking-[0.5px] mb-2">
              TARIFF TYPE
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View className="flex-row gap-2">
                {TARIFF_TYPES.map((t) => (
                  <Chip
                    key={t.id}
                    label={t.label}
                    active={tariffType === t.id}
                    onPress={() => setTariffType(t.id)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Green only toggle + compare button */}
          <View className="flex-row items-center gap-2.5">

            <Pressable
              onPress={() => setGreenOnly(!greenOnly)}
              className="flex-row items-center gap-2 flex-1"
            >
              {/* Toggle pill — height 22px has no exact Tailwind step, kept via style */}
              {/* bg-brand-green = #22A660  (config › brand.green) */}
              <View
                className={[
                  'justify-center px-0.5 rounded-full',
                  greenOnly ? 'bg-brand-green' : 'bg-border',
                ].join(' ')}
                style={{ width: 38, height: 22 }}
              >
                {/* w-[18px] h-[18px] — no exact Tailwind step (between w-4=16 and w-5=20) */}
                <View
                  className="rounded-full bg-white"
                  style={{
                    width: 18, height: 18,
                    alignSelf: greenOnly ? 'flex-end' : 'flex-start',
                  }}
                />
              </View>
              <Text
                className={[
                  'text-sm font-sans',
                  greenOnly
                    ? 'text-brand-green'
                    : 'text-[#4A6A82] dark:text-brand-fg-muted',
                ].join(' ')}
              >
                🌿 Green only
              </Text>
            </Pressable>

            {/* Compare button
                rounded-banner = 10px, px-4 = 16px, py-2 ≈ 9px original */}
            <Pressable
              onPress={handleCompare}
              disabled={isComparing}
              className={[
                'bg-primary rounded-banner px-4 py-2 items-center',
                isComparing ? 'opacity-70' : 'opacity-100',
              ].join(' ')}
            >
              <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
                {isComparing ? 'Comparing…' : 'Compare'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ── Loading state ─────────────────────────────────────────── */}
        {isComparing && !comparison && (
          /* py-10 = 40px  (Tailwind default) */
          <View className="items-center py-10 gap-3">
            <ActivityIndicator size="large" color="#2272A6" />
            {/* text-sm = 14px  (config › fontSize.sm) */}
            <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Fetching best tariffs…
            </Text>
          </View>
        )}

        {/* ── Results ───────────────────────────────────────────────── */}
        {comparison && !isComparing && (
          <>
            <BestDealBanner bestDeal={comparison.bestDeal} />

            {/* Current cost stats card */}
            <View className="bg-card rounded-xl p-3 border border-border mb-3.5 flex-row justify-between">
              <View>
                {/* text-xs = 11px  (config › fontSize.11) */}
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Current est. annual spend
                </Text>
                {/* text-base = 16px  (config › fontSize.base) */}
                <Text className="text-base font-bold text-brand dark:text-brand-fg">
                  £{comparison.comparison.currentAnnualCost?.toLocaleString()}
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  vs {comparison.comparison.currentElectricitySupplier}
                </Text>
                <Text className="text-xs font-sans mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">
                  Ofgem cap rates
                </Text>
              </View>
            </View>

            {tariffs.map((t, i) => (
              <TariffCard key={t._id} tariff={t} rank={i + 1} />
            ))}

            {tariffs.length === 0 && (
              <View className="items-center py-8 gap-2">
                <Text className="text-base font-semibold text-brand dark:text-brand-fg">
                  No tariffs found
                </Text>
                <Text className="text-sm font-sans text-center text-[#4A6A82] dark:text-brand-fg-muted">
                  Try changing your filters
                </Text>
              </View>
            )}
          </>
        )}

      </ScrollView>
    </View>
  );
}