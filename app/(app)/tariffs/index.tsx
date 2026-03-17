import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { useTariffStore } from '@/lib/store/tariff.store';
import type { EnrichedTariff } from '@/lib/types/tariff.types';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';

const B = { navy: '#0D2C40', blue: '#2272A6', blueBrt: '#3D9DD4', fg: '#F0F8FF', fgMuted: '#7AAEC8' };

const FUEL_TYPES   = [{ id: 'dual', label: '⚡🔥 Dual' }, { id: 'electricity', label: '⚡ Electricity' }, { id: 'gas', label: '🔥 Gas' }];
const TARIFF_TYPES = [{ id: 'any', label: 'All' }, { id: 'fixed', label: 'Fixed' }, { id: 'variable', label: 'Variable' }, { id: 'flexible', label: 'Flexible' }];

// ── Top nav tabs ───────────────────────────────────────────
const TOP_TABS = [
  { id: 'compare',   label: 'Compare',   route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',    route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers', route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator',route: '/(app)/tariffs/calculate' },
];

function TopTabs({ active, isDark }: { active: string; isDark: boolean }) {
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: isDark ? '#0A1929' : '#0D2C40',
      paddingHorizontal: 16,
      paddingBottom: 0,
    }}>
      {TOP_TABS.map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => router.push(tab.route as any)}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{
            color: active === tab.id ? '#FFFFFF' : '#7AAEC8',
            fontSize: 12, fontFamily: active === tab.id ? 'Poppins-SemiBold' : 'Poppins',
          }}>{tab.label}</Text>
          {active === tab.id && (
            <View style={{
              position: 'absolute', bottom: 0,
              height: 2, width: '80%', backgroundColor: B.blueBrt, borderRadius: 2,
            }} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

function Chip({ label, active, onPress, isDark }: {
  label: string; active: boolean; onPress: () => void; isDark: boolean;
}) {
  return (
    <Pressable onPress={onPress}>
      <View style={{
        paddingHorizontal: 13, paddingVertical: 7, borderRadius: 20, borderWidth: 1,
        borderColor: active ? B.blue : isDark ? '#1E3A52' : '#D5DEE8',
        backgroundColor: active ? (isDark ? '#1A3A54' : '#EDF5FB') : (isDark ? '#132030' : '#F8FAFC'),
      }}>
        <Text style={{ fontSize: 12, fontFamily: 'Poppins',
          color: active ? B.blue : isDark ? '#7AAEC8' : '#4A6A82' }}>{label}</Text>
      </View>
    </Pressable>
  );
}

function BestDealBanner({ bestDeal, isDark }: { bestDeal: any; isDark: boolean }) {
  const scale = useSharedValue(0.95);
  React.useEffect(() => { scale.value = withSpring(1, { damping: 14 }); }, []);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  if (!bestDeal) return null;
  return (
    <Animated.View style={style}>
      <View style={{
        borderRadius: 16, padding: 16, marginBottom: 14,
        backgroundColor: isDark ? '#1A3A54' : '#EDF5FB',
        borderWidth: 1.5, borderColor: B.blue,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View style={{ backgroundColor: B.blue, borderRadius: 6, padding: 4 }}>
            <Text style={{ fontSize: 12 }}>⭐</Text>
          </View>
          <Text style={{ color: B.blue, fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            Best Deal Found
          </Text>
        </View>
        <Text style={{ color: isDark ? B.fg : B.navy, fontSize: 16, fontWeight: '700',
          fontFamily: 'Poppins-Bold' }}>{bestDeal.supplier}</Text>
        <Text style={{ color: isDark ? B.fgMuted : '#4A6A82', fontSize: 13,
          fontFamily: 'Poppins', marginTop: 2 }}>{bestDeal.tariffName}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between',
          marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: `${B.blue}30` }}>
          <View>
            <Text style={{ color: isDark ? B.fgMuted : '#4A6A82', fontSize: 11, fontFamily: 'Poppins' }}>Annual cost</Text>
            <Text style={{ color: isDark ? B.fg : B.navy, fontSize: 18, fontWeight: '700',
              fontFamily: 'Poppins-Bold' }}>£{bestDeal.annualCost?.toLocaleString()}</Text>
          </View>
          {bestDeal.annualSaving > 0 && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: '#2DD4A0', fontSize: 11, fontFamily: 'Poppins' }}>You save</Text>
              <Text style={{ color: '#2DD4A0', fontSize: 18, fontWeight: '700',
                fontFamily: 'Poppins-Bold' }}>£{Math.round(bestDeal.annualSaving).toLocaleString()}/yr</Text>
            </View>
          )}
        </View>
        <Pressable
          onPress={() => router.push(`/(app)/tariffs/${bestDeal.tariffId}` as any)}
          style={{ marginTop: 12, backgroundColor: B.blue, borderRadius: 10,
            paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            View This Deal
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function TariffCard({ tariff, rank, isDark }: { tariff: EnrichedTariff; rank: number; isDark: boolean }) {
  const saving = tariff.calculated?.annualSaving;
  const isChp  = saving !== null && saving !== undefined && saving > 0;
  const textFg = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  return (
    <Pressable onPress={() => router.push(`/(app)/tariffs/${tariff._id}` as any)}>
      <View style={{
        backgroundColor: isDark ? '#132030' : '#FFFFFF',
        borderRadius: 14, padding: 16, marginBottom: 10,
        borderWidth: 1, borderColor: isChp ? `${B.blue}50` : borderC,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
              <View style={{
                width: 22, height: 22, borderRadius: 11,
                backgroundColor: rank === 1 ? B.blue : (isDark ? '#1E3A52' : '#E5EDF3'),
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ color: rank === 1 ? '#fff' : mutedFg, fontSize: 10, fontWeight: '700' }}>{rank}</Text>
              </View>
              <Text style={{ color: textFg, fontSize: 15, fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>
                {tariff.supplier}
              </Text>
              {tariff.isLive && (
                <View style={{ backgroundColor: '#2DD4A015', borderRadius: 6,
                  paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#2DD4A035' }}>
                  <Text style={{ color: '#2DD4A0', fontSize: 9, fontWeight: '700' }}>● LIVE</Text>
                </View>
              )}
              {tariff.isGreen && (
                <Text style={{ color: '#22A660', fontSize: 11 }}>🌿</Text>
              )}
            </View>
            <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>{tariff.tariffName}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            {tariff.calculated?.totalAnnualCost && (
              <>
                <Text style={{ color: textFg, fontSize: 18, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
                  £{tariff.calculated.totalAnnualCost.toLocaleString()}
                </Text>
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>per year</Text>
              </>
            )}
          </View>
        </View>

        {/* Rate boxes */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
          {tariff.electricity?.unitRate && (
            <View style={{ flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
              borderRadius: 8, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
                {tariff.electricity.unitRate}p
              </Text>
              <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Elec/kWh</Text>
            </View>
          )}
          {tariff.gas?.unitRate && (
            <View style={{ flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
              borderRadius: 8, padding: 8, alignItems: 'center' }}>
              <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
                {tariff.gas.unitRate}p
              </Text>
              <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Gas/kWh</Text>
            </View>
          )}
          <View style={{ flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
            borderRadius: 8, padding: 8, alignItems: 'center' }}>
            <Text style={{ color: textFg, fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
              {tariff.contractLengthMonths > 0 ? `${tariff.contractLengthMonths}m` : 'None'}
            </Text>
            <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Contract</Text>
          </View>
          <View style={{ flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
            borderRadius: 8, padding: 8, alignItems: 'center' }}>
            <Text style={{ color: textFg, fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
              £{tariff.calculated?.monthlyCost ?? '—'}
            </Text>
            <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Monthly</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', gap: 6, flex: 1, flexWrap: 'wrap' }}>
            {tariff.cashback > 0 && (
              <View style={{ backgroundColor: '#2DD4A015', borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#2DD4A030' }}>
                <Text style={{ color: '#2DD4A0', fontSize: 10, fontFamily: 'Poppins' }}>£{tariff.cashback} cashback</Text>
              </View>
            )}
            {tariff.exitFee === 0 && (
              <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 6,
                paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>No exit fee</Text>
              </View>
            )}
          </View>
          {isChp && (
            <Text style={{ color: '#2DD4A0', fontSize: 12, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
              Save £{Math.round(saving!).toLocaleString()}/yr
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

export default function TariffsCompareScreen() {
  const { comparison, isComparing, runComparison } = useTariffStore();
  const { profile } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fuelType,   setFuelType]   = React.useState<'dual' | 'electricity' | 'gas'>('dual');
  const [tariffType, setTariffType] = React.useState('any');
  const [greenOnly,  setGreenOnly]  = React.useState(false);

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  const handleCompare = async () => {
    try {
      await runComparison({
        fuelType, tariffType: tariffType as any,
        isGreen: greenOnly || undefined,
        annualElectricityKwh: profile?.energy?.annualElectricityKwh ?? undefined,
        annualGasKwh:         profile?.energy?.annualGasKwh         ?? undefined,
        currentElectricitySupplier: profile?.energy?.currentElectricitySupplier ?? undefined,
        currentGasSupplier:         profile?.energy?.currentGasSupplier         ?? undefined,
        limit: 15,
      });
    } catch {}
  };

  React.useEffect(() => { handleCompare(); }, []);

  const tariffs = (comparison?.tariffs ?? []) as EnrichedTariff[];

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ backgroundColor: B.navy, paddingTop: 56, paddingBottom: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={{ color: B.fg, fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            Tariffs
          </Text>
          <Text style={{ color: B.fgMuted, fontSize: 13, fontFamily: 'Poppins', marginTop: 2 }}>
            {comparison ? `${tariffs.length} tariffs — cheapest first` : 'Compare UK energy tariffs'}
          </Text>
        </View>
        <TopTabs active="compare" isDark={isDark} />
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isComparing} onRefresh={handleCompare} tintColor={B.blue} />}>

        {/* Filters */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 14, padding: 14,
          borderWidth: 1, borderColor: borderC, marginBottom: 16, gap: 12,
        }}>
          <View>
            <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins',
              letterSpacing: 0.5, marginBottom: 8 }}>FUEL TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {FUEL_TYPES.map(f => (
                  <Chip key={f.id} label={f.label} isDark={isDark}
                    active={fuelType === f.id} onPress={() => setFuelType(f.id as any)} />
                ))}
              </View>
            </ScrollView>
          </View>
          <View>
            <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins',
              letterSpacing: 0.5, marginBottom: 8 }}>TARIFF TYPE</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {TARIFF_TYPES.map(t => (
                  <Chip key={t.id} label={t.label} isDark={isDark}
                    active={tariffType === t.id} onPress={() => setTariffType(t.id)} />
                ))}
              </View>
            </ScrollView>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Pressable onPress={() => setGreenOnly(!greenOnly)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              <View style={{
                width: 38, height: 22, borderRadius: 11,
                backgroundColor: greenOnly ? '#22A660' : (isDark ? '#1E3A52' : '#D5DEE8'),
                justifyContent: 'center', paddingHorizontal: 2,
              }}>
                <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: '#fff',
                  alignSelf: greenOnly ? 'flex-end' : 'flex-start' }} />
              </View>
              <Text style={{ color: greenOnly ? '#22A660' : mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>
                🌿 Green only
              </Text>
            </Pressable>
            <Pressable onPress={handleCompare} disabled={isComparing}
              style={{ backgroundColor: B.blue, borderRadius: 10,
                paddingHorizontal: 16, paddingVertical: 9, opacity: isComparing ? 0.7 : 1 }}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
                {isComparing ? 'Comparing…' : 'Compare'}
              </Text>
            </Pressable>
          </View>
        </View>

        {isComparing && !comparison && (
          <View style={{ alignItems: 'center', paddingVertical: 40, gap: 12 }}>
            <ActivityIndicator size="large" color={B.blue} />
            <Text style={{ color: mutedFg, fontSize: 14, fontFamily: 'Poppins' }}>Fetching best tariffs…</Text>
          </View>
        )}

        {comparison && !isComparing && (
          <>
            <BestDealBanner bestDeal={comparison.bestDeal} isDark={isDark} />
            <View style={{
              backgroundColor: cardBg, borderRadius: 12, padding: 12,
              borderWidth: 1, borderColor: borderC, marginBottom: 14,
              flexDirection: 'row', justifyContent: 'space-between',
            }}>
              <View>
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>Current est. annual spend</Text>
                <Text style={{ color: textFg, fontSize: 16, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
                  £{comparison.comparison.currentAnnualCost?.toLocaleString()}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
                  vs {comparison.comparison.currentElectricitySupplier}
                </Text>
                <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins', marginTop: 2 }}>
                  Ofgem cap rates
                </Text>
              </View>
            </View>
            {tariffs.map((t, i) => <TariffCard key={t._id} tariff={t} rank={i + 1} isDark={isDark} />)}
            {tariffs.length === 0 && (
              <View style={{ alignItems: 'center', paddingVertical: 32, gap: 8 }}>
                <Text style={{ color: textFg, fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>No tariffs found</Text>
                <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins', textAlign: 'center' }}>
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
