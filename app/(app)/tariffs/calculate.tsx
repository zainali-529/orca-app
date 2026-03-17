import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const B = { navy: '#0D2C40', blue: '#2272A6', blueBrt: '#3D9DD4', fg: '#F0F8FF', fgMuted: '#7AAEC8' };

const TOP_TABS = [
  { id: 'compare',   label: 'Compare',    route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',     route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers',  route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator', route: '/(app)/tariffs/calculate' },
];

function TopTabs({ active, isDark }: { active: string; isDark: boolean }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#0A1929' : '#0D2C40' }}>
      {TOP_TABS.map((tab) => (
        <Pressable key={tab.id} onPress={() => router.push(tab.route as any)}
          style={{ flex: 1, alignItems: 'center', paddingVertical: 10 }}>
          <Text style={{
            color: active === tab.id ? '#FFFFFF' : '#7AAEC8', fontSize: 12,
            fontFamily: active === tab.id ? 'Poppins-SemiBold' : 'Poppins',
          }}>{tab.label}</Text>
          {active === tab.id && (
            <View style={{ position: 'absolute', bottom: 0, height: 2, width: '80%',
              backgroundColor: B.blueBrt, borderRadius: 2 }} />
          )}
        </Pressable>
      ))}
    </View>
  );
}

function InputField({ label, value, onChangeText, placeholder, hint, isDark }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; hint?: string; isDark: boolean;
}) {
  const borderColor = isDark ? '#1E3A52' : '#D5DEE8';
  const bgColor     = isDark ? '#132030' : '#FFFFFF';
  const textColor   = isDark ? '#F0F8FF' : '#0D2C40';

  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 13,
        fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>{label}</Text>
      <View style={{
        backgroundColor: bgColor, borderRadius: 10, borderWidth: 1,
        borderColor, flexDirection: 'row', alignItems: 'center', overflow: 'hidden',
      }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#4A6A82' : '#A0B4C0'}
          keyboardType="numeric"
          style={{
            flex: 1, padding: 12, fontSize: 15,
            color: textColor, fontFamily: 'Poppins',
          }}
        />
        {hint && (
          <View style={{ paddingRight: 12 }}>
            <Text style={{ color: isDark ? '#7AAEC8' : '#4A6A82', fontSize: 12,
              fontFamily: 'Poppins' }}>{hint}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function CostResult({ result, isDark }: { result: any; isDark: boolean }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value    = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 16 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';
  const innerBg = isDark ? '#0D2C40' : '#F0F6FB';

  const { tariff, costs, breakdown } = result;

  return (
    <Animated.View style={[{ gap: 12 }, style]}>

      {/* Tariff info */}
      <View style={{
        backgroundColor: isDark ? '#1A3A54' : '#EDF5FB',
        borderRadius: 14, padding: 16,
        borderWidth: 1.5, borderColor: B.blue,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ fontSize: 20 }}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: isDark ? B.fg : B.navy, fontSize: 15, fontWeight: '700',
              fontFamily: 'Poppins-Bold' }}>{tariff.supplier}</Text>
            <Text style={{ color: isDark ? B.fgMuted : '#4A6A82', fontSize: 12,
              fontFamily: 'Poppins' }}>{tariff.tariffName}</Text>
          </View>
          {tariff.isGreen && <Text style={{ fontSize: 18 }}>🌿</Text>}
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ backgroundColor: '#2272A620', borderRadius: 6,
            paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: B.blue, fontSize: 10, fontFamily: 'Poppins',
              textTransform: 'capitalize' }}>{tariff.tariffType}</Text>
          </View>
          <View style={{ backgroundColor: '#2272A620', borderRadius: 6,
            paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: B.blue, fontSize: 10, fontFamily: 'Poppins',
              textTransform: 'capitalize' }}>{tariff.fuelType}</Text>
          </View>
          {tariff.exitFee === 0 && (
            <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB',
              borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>No exit fee</Text>
            </View>
          )}
        </View>
      </View>

      {/* Main cost cards */}
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[
          { label: 'Annual', value: `£${costs.totalAnnualCost?.toLocaleString() ?? '—'}` },
          { label: 'Monthly', value: `£${costs.monthlyAverage ?? '—'}` },
          { label: 'Weekly', value: `£${costs.weeklyAverage ?? '—'}` },
          { label: 'Daily', value: `£${costs.dailyAverage?.toFixed(2) ?? '—'}` },
        ].map((item) => (
          <View key={item.label} style={{
            flex: 1, backgroundColor: cardBg, borderRadius: 12,
            padding: 12, alignItems: 'center', gap: 4,
            borderWidth: 1, borderColor: borderC,
          }}>
            <Text style={{ color: textFg, fontSize: 16, fontWeight: '700',
              fontFamily: 'Poppins-Bold' }}>{item.value}</Text>
            <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Breakdown */}
      {(breakdown.electricity || breakdown.gas) && (
        <View style={{
          backgroundColor: cardBg, borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: borderC,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold', marginBottom: 12 }}>Cost Breakdown</Text>

          {breakdown.electricity && (
            <View style={{ marginBottom: 14 }}>
              <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
                letterSpacing: 0.5, marginBottom: 8 }}>⚡ ELECTRICITY</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>{breakdown.electricity.unitRate}p</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Unit rate/kWh</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>{breakdown.electricity.standingCharge}p</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Standing/day</Text>
                </View>
                {breakdown.electricity.usageCost && (
                  <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                    padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: textFg, fontSize: 14, fontWeight: '700',
                      fontFamily: 'Poppins-Bold' }}>£{breakdown.electricity.usageCost}</Text>
                    <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                      textAlign: 'center', marginTop: 2 }}>Usage cost</Text>
                  </View>
                )}
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: textFg, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>£{breakdown.electricity.standingTotal}</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Standing total</Text>
                </View>
              </View>
            </View>
          )}

          {breakdown.gas && (
            <View>
              <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
                letterSpacing: 0.5, marginBottom: 8 }}>🔥 GAS</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>{breakdown.gas.unitRate}p</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Unit rate/kWh</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: B.blueBrt, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>{breakdown.gas.standingCharge}p</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Standing/day</Text>
                </View>
                {breakdown.gas.usageCost && (
                  <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                    padding: 10, alignItems: 'center' }}>
                    <Text style={{ color: textFg, fontSize: 14, fontWeight: '700',
                      fontFamily: 'Poppins-Bold' }}>£{breakdown.gas.usageCost}</Text>
                    <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                      textAlign: 'center', marginTop: 2 }}>Usage cost</Text>
                  </View>
                )}
                <View style={{ flex: 1, backgroundColor: innerBg, borderRadius: 8,
                  padding: 10, alignItems: 'center' }}>
                  <Text style={{ color: textFg, fontSize: 14, fontWeight: '700',
                    fontFamily: 'Poppins-Bold' }}>£{breakdown.gas.standingTotal}</Text>
                  <Text style={{ color: mutedFg, fontSize: 9, fontFamily: 'Poppins',
                    textAlign: 'center', marginTop: 2 }}>Standing total</Text>
                </View>
              </View>
            </View>
          )}

          {/* VAT note */}
          <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
            marginTop: 12, lineHeight: 16 }}>
            All rates include 5% VAT. Costs are estimates based on your entered usage.
          </Text>
        </View>
      )}

      {/* View detail button */}
      <Pressable
        onPress={() => router.push(`/(app)/tariffs/${tariff._id}` as any)}
        style={{
          backgroundColor: B.blue, borderRadius: 12, paddingVertical: 13,
          alignItems: 'center', flexDirection: 'row',
          justifyContent: 'center', gap: 8,
        }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
          View Full Tariff Details
        </Text>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M9 18l6-6-6-6" stroke="#fff" strokeWidth="2.5"
            strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </Animated.View>
  );
}

// ── Pre-loaded tariffs for selection ──────────────────────
function TariffPicker({ tariffs, selectedId, onSelect, isDark }: {
  tariffs: any[]; selectedId: string; onSelect: (id: string) => void; isDark: boolean;
}) {
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  if (tariffs.length === 0) return null;

  return (
    <View style={{ gap: 8 }}>
      {tariffs.map((t) => (
        <Pressable key={t._id} onPress={() => onSelect(t._id)}>
          <View style={{
            backgroundColor: selectedId === t._id
              ? (isDark ? '#1A3A54' : '#EDF5FB')
              : cardBg,
            borderRadius: 12, padding: 14,
            borderWidth: selectedId === t._id ? 1.5 : 1,
            borderColor: selectedId === t._id ? B.blue : borderC,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}>
            <View style={{
              width: 22, height: 22, borderRadius: 11,
              borderWidth: selectedId === t._id ? 0 : 1.5,
              borderColor: isDark ? '#1E3A52' : '#C8DCE9',
              backgroundColor: selectedId === t._id ? B.blue : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {selectedId === t._id && (
                <Svg width="12" height="12" viewBox="0 0 12 12">
                  <Path d="M2 6l3 3 5-5" fill="none" stroke="#fff"
                    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: selectedId === t._id ? B.blue : textFg,
                fontSize: 13, fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>
                {t.supplier}
              </Text>
              <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins' }}>
                {t.tariffName}
              </Text>
            </View>
            {t.electricity?.unitRate && (
              <Text style={{ color: B.blueBrt, fontSize: 13, fontWeight: '700',
                fontFamily: 'Poppins-Bold' }}>{t.electricity.unitRate}p</Text>
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default function CalculatorScreen() {
  const { tariffs, isLoadingList, loadTariffs, calculateCost, calculateResult, isCalculating } = useTariffStore();
  const { profile } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [elecKwh,     setElecKwh]    = React.useState(
    profile?.energy?.annualElectricityKwh?.toString() ?? '2900'
  );
  const [gasKwh,      setGasKwh]     = React.useState(
    profile?.energy?.annualGasKwh?.toString() ?? '11500'
  );
  const [selectedId,  setSelectedId] = React.useState('');
  const [error,       setError]      = React.useState('');

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  // Load a small list of tariffs for picker
  React.useEffect(() => {
    loadTariffs({ fuelType: 'dual', tariffType: 'fixed', sortBy: 'annualCost', limit: 10 });
  }, []);

  const handleCalculate = async () => {
    if (!selectedId) { setError('Please select a tariff first'); return; }
    setError('');
    try {
      await calculateCost({
        tariffId:             selectedId,
        annualElectricityKwh: elecKwh ? Number(elecKwh) : null,
        annualGasKwh:         gasKwh  ? Number(gasKwh)  : null,
      });
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Calculation failed. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

      {/* Header */}
      <View style={{ backgroundColor: B.navy, paddingTop: 56, paddingBottom: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={{ color: B.fg, fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            Tariffs
          </Text>
          <Text style={{ color: B.fgMuted, fontSize: 13, fontFamily: 'Poppins', marginTop: 2 }}>
            Calculate exact costs for your usage
          </Text>
        </View>
        <TopTabs active="calculate" isDark={isDark} />
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Usage inputs */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: borderC, marginBottom: 14, gap: 14,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold' }}>Your Annual Usage</Text>
          <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins', marginTop: -8 }}>
            Pre-filled from your profile. Edit to get personalised costs.
          </Text>
          <InputField label="⚡ Electricity (kWh/year)"
            value={elecKwh} onChangeText={setElecKwh}
            placeholder="e.g. 2900" hint="kWh" isDark={isDark} />
          <InputField label="🔥 Gas (kWh/year)"
            value={gasKwh} onChangeText={setGasKwh}
            placeholder="e.g. 11500" hint="kWh" isDark={isDark} />
          <View style={{
            backgroundColor: isDark ? '#0D2C40' : '#F0F6FB', borderRadius: 8, padding: 10,
            flexDirection: 'row', gap: 20,
          }}>
            <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
              UK avg: 2,900 kWh elec
            </Text>
            <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
              UK avg: 11,500 kWh gas
            </Text>
          </View>
        </View>

        {/* Tariff picker */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: borderC, marginBottom: 14,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold', marginBottom: 4 }}>Select Tariff</Text>
          <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins', marginBottom: 12 }}>
            Showing cheapest fixed dual fuel tariffs. Browse all in the Browse tab.
          </Text>

          {isLoadingList ? (
            <ActivityIndicator color={B.blue} />
          ) : (
            <TariffPicker
              tariffs={tariffs}
              selectedId={selectedId}
              onSelect={setSelectedId}
              isDark={isDark}
            />
          )}
        </View>

        {error ? (
          <View style={{
            backgroundColor: '#E24B4A15', borderRadius: 10, padding: 12,
            marginBottom: 12, borderWidth: 1, borderColor: '#E24B4A30',
          }}>
            <Text style={{ color: '#E24B4A', fontSize: 13, fontFamily: 'Poppins' }}>{error}</Text>
          </View>
        ) : null}

        {/* Calculate button */}
        <Pressable
          onPress={handleCalculate}
          disabled={isCalculating || !selectedId}
          style={{
            backgroundColor: !selectedId ? (isDark ? '#1A3A54' : '#B0CCE0') : B.blue,
            height: 52, borderRadius: 14, alignItems: 'center',
            justifyContent: 'center', marginBottom: 20,
            opacity: isCalculating ? 0.7 : 1,
          }}>
          {isCalculating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700',
              fontFamily: 'Poppins-Bold' }}>
              Calculate Cost
            </Text>
          )}
        </Pressable>

        {/* Result */}
        {calculateResult && !isCalculating && (
          <CostResult result={calculateResult} isDark={isDark} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
