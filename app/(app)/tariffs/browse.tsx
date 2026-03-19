import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TOP_TABS = [
  { id: 'compare',   label: 'Compare',    route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',     route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers',  route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator', route: '/(app)/tariffs/calculate' },
];

const SUPPLIERS_FILTER = ['All', 'Octopus Energy', 'British Gas', 'EDF Energy', 'E.ON Next',
  'Scottish Power', 'Ovo Energy', 'Shell Energy', 'So Energy'];
const FUEL_OPTS  = [{ id: '', label: 'All' }, { id: 'dual', label: 'Dual' },
  { id: 'electricity', label: 'Electricity' }, { id: 'gas', label: 'Gas' }];
const TYPE_OPTS  = [{ id: '', label: 'All' }, { id: 'fixed', label: 'Fixed' },
  { id: 'variable', label: 'Variable' }, { id: 'flexible', label: 'Flexible' }];
const SORT_OPTS  = [{ id: 'annualCost', label: 'Cheapest' }, { id: 'rating', label: 'Rating' },
  { id: 'cashback', label: 'Cashback' }];

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

// ─── Filter chip ──────────────────────────────────────────────────────────────

function Chip({ label, active, onPress }: {
  label: string; active: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <View
        className={[
          'px-3.5 py-1.5 rounded-full border',
          active
            ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
            : 'border-border bg-card',
        ].join(' ')}
      >
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function BrowseScreen() {
  const { tariffs, pagination, isLoadingList, loadTariffs } = useTariffStore();

  const [fuelType,   setFuelType]   = React.useState('');
  const [tariffType, setTariffType] = React.useState('');
  const [supplier,   setSupplier]   = React.useState('All');
  const [sortBy,     setSortBy]     = React.useState('annualCost');
  const [greenOnly,  setGreenOnly]  = React.useState(false);
  const [page,       setPage]       = React.useState(1);

  const fetchTariffs = (p = 1) => {
    loadTariffs({
      fuelType:   fuelType   || undefined,
      tariffType: tariffType || undefined,
      supplier:   supplier === 'All' ? undefined : supplier,
      isGreen:    greenOnly ? 'true' : undefined,
      sortBy,
      order: 'asc',
      page: p,
      limit: 15,
    });
    setPage(p);
  };

  React.useEffect(() => { fetchTariffs(1); }, [fuelType, tariffType, supplier, sortBy, greenOnly]);

  // ── List item ───────────────────────────────────────────────────────────────

  const renderItem = ({ item: t, index: i }: any) => {
    const globalIndex = (page - 1) * 15 + i;
    const isFirst     = globalIndex === 0;

    return (
      <Pressable onPress={() => router.push(`/(app)/tariffs/${t._id}` as any)}>
        {/* rounded-card = 14px, mb-2 = 8px, p-3.5 = 14px  */}
        <View className="bg-card rounded-card p-3.5 mb-2 border border-border flex-row items-center gap-3">

          {/* Rank circle — w-7 h-7 = 28px  (Tailwind default) */}
          <View
            className={[
              'w-7 h-7 rounded-full items-center justify-center',
              isFirst ? 'bg-primary' : 'bg-muted dark:bg-border/20',
            ].join(' ')}
          >
            <Text
              className={[
                'text-xs font-bold',
                isFirst ? 'text-white' : 'text-[#4A6A82] dark:text-brand-fg-muted',
              ].join(' ')}
            >
              {globalIndex + 1}
            </Text>
          </View>

          {/* Info */}
          <View className="flex-1 gap-1">

            {/* Supplier + badges */}
            <View className="flex-row items-center gap-1.5">
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
                {t.supplier}
              </Text>
              {t.source === 'octopus' && (
                <View className="bg-brand-teal/8 rounded px-1 py-0.5">
                  <Text className="text-xs font-bold text-brand-teal">● LIVE</Text>
                </View>
              )}
              {!!t.isGreen && (
                <Text className="text-xs">🌿</Text>
              )}
            </View>

            {/* Tariff name */}
            <Text
              className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted"
              numberOfLines={1}
            >
              {t.tariffName}
            </Text>

            {/* Type + fuel badges */}
            <View className="flex-row gap-1.5 mt-0.5">
              <View className="bg-primary/6 dark:bg-brand rounded px-1.5 py-0.5">
                <Text className="text-xs font-sans capitalize text-[#4A6A82] dark:text-brand-fg-muted">
                  {t.tariffType}
                </Text>
              </View>
              <View className="bg-primary/6 dark:bg-brand rounded px-1.5 py-0.5">
                <Text className="text-xs font-sans capitalize text-[#4A6A82] dark:text-brand-fg-muted">
                  {t.fuelType}
                </Text>
              </View>
            </View>
          </View>

          {/* Rates + chevron */}
          <View className="items-end gap-1">
            {t.electricity?.unitRate != null && (
              <Text className="text-sm font-bold text-brand-blue-bright">
                {t.electricity.unitRate}p/kWh
              </Text>
            )}
            {t.gas?.unitRate != null && (
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                Gas {t.gas.unitRate}p
              </Text>
            )}
            {t.cashback > 0 && (
              <Text className="text-xs font-sans text-brand-teal">
                £{t.cashback} back
              </Text>
            )}
            <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <Path
                d="M9 18l6-6-6-6"
                stroke="#8BA8C4"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Page header — always brand navy ──────────────────────── */}
      <View className="bg-brand pt-14">
        <View className="px-5 pb-3.5">
          <Text className="text-xl font-bold text-brand-fg">Tariffs</Text>
          <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
            {pagination
              ? `${pagination.total} tariffs in database`
              : 'Browse all UK tariffs'}
          </Text>
        </View>
        <TopTabs active="browse" />
      </View>

      {/* ── Filter strip ─────────────────────────────────────────── */}
      <View className="bg-card border-b border-border py-3">

        {/* Fuel + type + green chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {FUEL_OPTS.map((f) => (
            <Chip key={f.id} label={f.label}
              active={fuelType === f.id} onPress={() => setFuelType(f.id)} />
          ))}
          {/* Divider */}
          <View className="w-px bg-border mx-1" />
          {TYPE_OPTS.map((t) => (
            <Chip key={t.id} label={t.label}
              active={tariffType === t.id} onPress={() => setTariffType(t.id)} />
          ))}
          <View className="w-px bg-border mx-1" />
          <Chip label="🌿 Green" active={greenOnly} onPress={() => setGreenOnly(!greenOnly)} />
        </ScrollView>

        {/* Supplier chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 8 }}
        >
          {SUPPLIERS_FILTER.map((s) => (
            <Chip key={s} label={s}
              active={supplier === s} onPress={() => setSupplier(s)} />
          ))}
        </ScrollView>

        {/* Sort chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 8 }}
        >
         <View className="self-center mr-1">
  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
    Sort:
  </Text>
</View>
          {SORT_OPTS.map((s) => (
            <Chip key={s.id} label={s.label}
              active={sortBy === s.id} onPress={() => setSortBy(s.id)} />
          ))}
        </ScrollView>
      </View>

      {/* ── List / loader ─────────────────────────────────────────── */}
      {isLoadingList ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2272A6" />
        </View>
      ) : (
        <FlatList
          data={tariffs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}

          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-base font-semibold text-brand dark:text-brand-fg">
                No tariffs found
              </Text>
              <Text className="text-sm font-sans mt-1.5 text-[#4A6A82] dark:text-brand-fg-muted">
                Try adjusting your filters
              </Text>
            </View>
          }

          ListFooterComponent={
            pagination && pagination.totalPages > 1 ? (
              <View className="flex-row justify-center gap-3 py-4">

                {/* Prev button */}
                {page > 1 && (
                  <Pressable
                    onPress={() => fetchTariffs(page - 1)}
                    className="bg-card rounded-banner px-4 py-2.5 border border-border"
                  >
                    <Text className="text-sm font-sans text-brand dark:text-brand-fg">
                      ← Prev
                    </Text>
                  </Pressable>
                )}

                {/* Page indicator */}
                <View className="bg-primary rounded-banner px-4 py-2.5 items-center">
                  <Text style={{ color: '#ffffff' }} className="text-sm font-sans">
                    {page} / {pagination.totalPages}
                  </Text>
                </View>

                {/* Next button */}
                {page < pagination.totalPages && (
                  <Pressable
                    onPress={() => fetchTariffs(page + 1)}
                    className="bg-card rounded-banner px-4 py-2.5 border border-border"
                  >
                    <Text className="text-sm font-sans text-brand dark:text-brand-fg">
                      Next →
                    </Text>
                  </Pressable>
                )}

              </View>
            ) : null
          }
        />
      )}

    </View>
  );
}