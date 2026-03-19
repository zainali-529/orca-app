import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

const TOP_TABS = [
  { id: 'compare',   label: 'Compare',    route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',     route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers',  route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator', route: '/(app)/tariffs/calculate' },
];

const SUPPLIER_EMOJIS: Record<string, string> = {
  'Octopus Energy':    '🐙',
  'British Gas':       '🔵',
  'EDF Energy':        '⚛️',
  'E.ON Next':         '🔆',
  'Scottish Power':    '⚡',
  'Ovo Energy':        '🍃',
  'Shell Energy':      '🐚',
  'So Energy':         '🌟',
  'Utility Warehouse': '🏠',
};

// ─── Top nav tabs ─────────────────────────────────────────────────────────────

function TopTabs({ active }: { active: string }) {
  return (
    <View className="flex-row bg-brand">
      {TOP_TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => router.push(tab.route as any)}
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
            <View className="absolute bottom-0 h-0.5 w-4/5 bg-brand-blue-bright rounded-sm" />
          )}
        </Pressable>
      ))}
    </View>
  );
}

// ─── Star rating ──────────────────────────────────────────────────────────────

function StarRating({ rating, size = 12 }: { rating: number | null | undefined; size?: number }) {
  if (!rating) return null;
  return (
    <View className="flex-row gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Svg key={s} width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= Math.round(rating) ? '#F59E0B' : 'transparent'}
            stroke="#F59E0B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ))}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SuppliersScreen() {
  const { suppliers, isLoadingSuppliers, loadSuppliers } = useTariffStore();

  React.useEffect(() => { loadSuppliers(); }, []);

  const sorted = [...suppliers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <View className="flex-1 bg-background">

      {/* ── Page header — always brand navy ──────────────────────── */}
      <View className="bg-brand pt-14">
        <View className="px-5 pb-3.5">
          <Text className="text-xl font-bold text-brand-fg">Tariffs</Text>
          <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
            {suppliers.length > 0
              ? `${suppliers.length} active suppliers`
              : 'UK energy suppliers'}
          </Text>
        </View>
        <TopTabs active="suppliers" />
      </View>

      {/* ── Loading ───────────────────────────────────────────────── */}
      {isLoadingSuppliers ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >

          {/* ── Info banner ─────────────────────────────────────────── */}
          <View className="bg-primary/7 rounded-xl p-3 border border-primary/15 mb-4 flex-row items-start gap-2.5">
            <Text style={{ fontSize: 18 }}>ℹ️</Text>
            <Text className="text-xs font-sans flex-1 leading-[18px] text-[#4A6A82] dark:text-brand-fg-muted">
              Octopus Energy rates are live from their API. All other suppliers use
              Ofgem price cap estimates. Tap a supplier to browse their tariffs.
            </Text>
          </View>

          {/* ── Supplier cards ──────────────────────────────────────── */}
          {sorted.map((s) => (
            <Pressable
              key={s.name}
              onPress={() => router.push({ pathname: '/(app)/tariffs/browse' } as any)}
            >
              {/* rounded-card = 14px  (config › borderRadius.card) */}
              <View className="bg-card rounded-card p-4 mb-2.5 border border-border">
                <View className="flex-row items-start gap-3.5">

                  {/* Emoji icon — w-12 h-12 = 48px  (Tailwind default) */}
                  <View className="w-12 h-12 rounded-xl bg-primary/6 dark:bg-brand items-center justify-center border border-border">
                    <Text style={{ fontSize: 24 }}>
                      {SUPPLIER_EMOJIS[s.name] ?? '⚡'}
                    </Text>
                  </View>

                  {/* Info */}
                  <View className="flex-1">

                    {/* Name + badge */}
                    <View className="flex-row items-center justify-between mb-1">
                      <Text className="text-base font-semibold text-brand dark:text-brand-fg">
                        {s.name}
                      </Text>
                      {s.name === 'Octopus Energy' ? (
                        <View className="bg-brand-teal/8 rounded-md px-2 py-1 border border-brand-teal/20">
                          <Text className="text-xs font-bold text-brand-teal">● LIVE API</Text>
                        </View>
                      ) : (
                        <View className="bg-primary/6 dark:bg-brand rounded-md px-2 py-1">
                          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                            Ofgem cap
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Rating row */}
                    <View className="flex-row items-center gap-1.5 mb-2.5">
                      <StarRating rating={s.rating} />
                      {!!s.rating && (
                        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                          {s.rating.toFixed(1)}/5
                        </Text>
                      )}
                      {s.hasGreen && (
                        <Text className="text-xs font-sans text-brand-green">
                          🌿 Green tariffs
                        </Text>
                      )}
                    </View>

                    {/* Stats row */}
                    <View className="flex-row gap-2">
                      {/* Tariff count */}
                      <View className="flex-1 bg-primary/6 dark:bg-brand-selected/20 rounded-lg p-2 items-center">
                        <Text className="text-base font-bold text-brand dark:text-brand-fg">
                          {s.tariffCount}
                        </Text>
                        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                          Tariffs
                        </Text>
                      </View>

                      {s.minElecRate != null && (
                        <View className="flex-1 bg-primary/6 dark:bg-brand-selected/20 rounded-lg p-2 items-center">
                          <Text className="text-base font-bold text-brand-blue-bright">
                            {s.minElecRate}p
                          </Text>
                          <Text className="text-[10px] font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                            Min elec/kWh
                          </Text>
                        </View>
                      )}

                      {s.minGasRate != null && (
                        <View className="flex-1 bg-primary/6 dark:bg-brand-selected/20 rounded-lg p-2 items-center">
                          <Text className="text-base font-bold text-brand-blue-bright">
                            {s.minGasRate}p
                          </Text>
                          <Text className="text-[10px] font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                            Min gas/kWh
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Fuel + tariff type tags */}
                    <View className="flex-row gap-1.5 mt-2.5 flex-wrap">
                      {s.fuelTypes?.map((f) => (
                        <View key={f} className="bg-primary/7 dark:bg-brand-selected/20 rounded-md px-2 py-1">
                          <Text className="text-xs font-sans capitalize text-[#4A6A82] dark:text-brand-fg-muted">
                            {f}
                          </Text>
                        </View>
                      ))}
                      {s.tariffTypes?.map((t) => (
                        <View key={t} className="bg-primary/6 dark:bg-brand-selected/20  rounded-md px-2 py-1">
                          <Text className="text-xs font-sans capitalize text-[#4A6A82] dark:text-brand-fg-muted">
                            {t}
                          </Text>
                        </View>
                      ))}
                    </View>

                  </View>
                </View>
              </View>
            </Pressable>
          ))}

        </ScrollView>
      )}
    </View>
  );
}