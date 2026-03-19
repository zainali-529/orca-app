import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
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
import { useColorScheme } from 'nativewind';

const TOP_TABS = [
  { id: 'compare',   label: 'Compare',    route: '/(app)/tariffs' },
  { id: 'browse',    label: 'Browse',     route: '/(app)/tariffs/browse' },
  { id: 'suppliers', label: 'Suppliers',  route: '/(app)/tariffs/suppliers' },
  { id: 'calculate', label: 'Calculator', route: '/(app)/tariffs/calculate' },
];


  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';
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

// ─── Input field ──────────────────────────────────────────────────────────────

function InputField({ label, value, onChangeText, placeholder, hint }: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder: string; hint?: string;
}) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
        {label}
      </Text>
      <View className="bg-card border border-border rounded-banner flex-row items-center overflow-hidden">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0B4C0"
          keyboardType="numeric"
          style={{
            flex: 1,
            padding: 12,
            fontSize: 15,
            fontFamily: 'Poppins',
            color: textColor,
          }}
        />
        {hint && (
          <View className="pr-3">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              {hint}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Cost result ──────────────────────────────────────────────────────────────

function CostResult({ result }: { result: any }) {
  const opacity    = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value    = withTiming(1, { duration: 400 });
    translateY.value = withSpring(0, { damping: 16 });
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const { tariff, costs, breakdown } = result;

  return (
    <Animated.View style={animStyle} className="gap-3">

      {/* Tariff info card */}
      <View
        className="bg-primary/7 dark:bg-brand-selected rounded-card border-primary"
        style={{ borderWidth: 1.5 }}
      >
        <View className="p-4">
          <View className="flex-row items-center gap-2 mb-2">
            <Text style={{ fontSize: 20 }}>⚡</Text>
            <View className="flex-1">
              <Text className="text-base font-bold text-brand dark:text-brand-fg">
                {tariff.supplier}
              </Text>
              <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {tariff.tariffName}
              </Text>
            </View>
            {!!tariff.isGreen && <Text style={{ fontSize: 18 }}>🌿</Text>}
          </View>

          {/* Type badges */}
          <View className="flex-row gap-2">
            <View className="bg-primary/13 rounded-md px-2 py-1">
              <Text className="text-xs font-sans capitalize text-primary">
                {tariff.tariffType}
              </Text>
            </View>
            <View className="bg-primary/13 rounded-md px-2 py-1">
              <Text className="text-xs font-sans capitalize text-primary">
                {tariff.fuelType}
              </Text>
            </View>
            {tariff.exitFee === 0 && (
              <View className="bg-primary/6 dark:bg-brand rounded-md px-2 py-1">
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  No exit fee
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Cost summary boxes */}
      <View className="flex-row gap-2.5">
        {[
          { label: 'Annual',  value: `£${costs.totalAnnualCost?.toLocaleString() ?? '—'}` },
          { label: 'Monthly', value: `£${costs.monthlyAverage ?? '—'}` },
          { label: 'Weekly',  value: `£${costs.weeklyAverage ?? '—'}` },
          { label: 'Daily',   value: `£${costs.dailyAverage?.toFixed(2) ?? '—'}` },
        ].map((item) => (
          <View
            key={item.label}
            className="flex-1 bg-card rounded-xl p-3 items-center gap-1 border border-border"
          >
            <Text className="text-base font-bold text-brand dark:text-brand-fg">
              {item.value}
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Breakdown card */}
      {(breakdown.electricity || breakdown.gas) && (
        <View className="bg-card rounded-card p-4 border border-border">
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-3">
            Cost Breakdown
          </Text>

          {/* Electricity breakdown */}
          {breakdown.electricity && (
            <View className="mb-3.5">
              <Text className="text-xs font-sans tracking-[0.5px] mb-2 text-[#4A6A82] dark:text-brand-fg-muted">
                ⚡ ELECTRICITY
              </Text>
              <View className="flex-row gap-2">
                {[
                  { val: `${breakdown.electricity.unitRate}p`,      label: 'Unit rate/kWh',   bright: true },
                  { val: `${breakdown.electricity.standingCharge}p`, label: 'Standing/day',    bright: true },
                  ...(breakdown.electricity.usageCost
                    ? [{ val: `£${breakdown.electricity.usageCost}`, label: 'Usage cost',      bright: false }]
                    : []),
                  { val: `£${breakdown.electricity.standingTotal}`, label: 'Standing total',  bright: false },
                ].map((box) => (
                  <View
                    key={box.label}
                    className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2.5 items-center"
                  >
                    <Text
                      className={[
                        'text-sm font-bold',
                        box.bright
                          ? 'text-brand-blue-bright'
                          : 'text-brand dark:text-brand-fg',
                      ].join(' ')}
                    >
                      {box.val}
                    </Text>
                    <Text className="text-xs font-sans text-center mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">
                      {box.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Gas breakdown */}
          {breakdown.gas && (
            <View>
              <Text className="text-xs font-sans tracking-[0.5px] mb-2 text-[#4A6A82] dark:text-brand-fg-muted">
                🔥 GAS
              </Text>
              <View className="flex-row gap-2">
                {[
                  { val: `${breakdown.gas.unitRate}p`,      label: 'Unit rate/kWh',  bright: true },
                  { val: `${breakdown.gas.standingCharge}p`, label: 'Standing/day',   bright: true },
                  ...(breakdown.gas.usageCost
                    ? [{ val: `£${breakdown.gas.usageCost}`, label: 'Usage cost',     bright: false }]
                    : []),
                  { val: `£${breakdown.gas.standingTotal}`, label: 'Standing total', bright: false },
                ].map((box) => (
                  <View
                    key={box.label}
                    className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2.5 items-center"
                  >
                    <Text
                      className={[
                        'text-sm font-bold',
                        box.bright
                          ? 'text-brand-blue-bright'
                          : 'text-brand dark:text-brand-fg',
                      ].join(' ')}
                    >
                      {box.val}
                    </Text>
                    <Text className="text-xs font-sans text-center mt-0.5 text-[#4A6A82] dark:text-brand-fg-muted">
                      {box.label}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* VAT note */}
          <Text className="text-xs font-sans mt-3 leading-4 text-[#4A6A82] dark:text-brand-fg-muted">
            All rates include 5% VAT. Costs are estimates based on your entered usage.
          </Text>
        </View>
      )}

      {/* View detail CTA */}
      <Pressable
        onPress={() => router.push(`/(app)/tariffs/${tariff._id}` as any)}
        className="bg-primary rounded-xl py-3 items-center flex-row justify-center gap-2"
      >
        <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
          View Full Tariff Details
        </Text>
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path
            d="M9 18l6-6-6-6"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </Pressable>

    </Animated.View>
  );
}

// ─── Tariff picker ────────────────────────────────────────────────────────────

function TariffPicker({ tariffs, selectedId, onSelect }: {
  tariffs: any[]; selectedId: string; onSelect: (id: string) => void;
}) {
  if (tariffs.length === 0) return null;

  return (
    <View className="gap-2">
      {tariffs.map((t) => {
        const isSelected = selectedId === t._id;
        return (
          <Pressable key={t._id} onPress={() => onSelect(t._id)}>
            <View
              className={[
                'rounded-xl p-3.5 flex-row items-center gap-3',
                isSelected
                  ? 'bg-primary/7 dark:bg-brand-selected/20 border-primary'
                  : 'bg-card border-border',
              ].join(' ')}
              style={{ borderWidth: isSelected ? 1.5 : 1 }}
            >
              {/* Radio circle — w-5.5 h-5.5 = 22px  (config › spacing.5.5) */}
              <View
                className={[
                  'w-5.5 h-5.5 rounded-full items-center justify-center',
                  isSelected ? 'bg-primary' : 'border-border',
                ].join(' ')}
                style={{ borderWidth: isSelected ? 0 : 1.5 }}
              >
                {isSelected && (
                  <Svg width="12" height="12" viewBox="0 0 12 12">
                    <Path
                      d="M2 6l3 3 5-5"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                )}
              </View>

              <View className="flex-1">
                <Text
                  className={[
                    'text-sm font-semibold',
                    isSelected ? 'text-primary' : 'text-brand dark:text-brand-fg',
                  ].join(' ')}
                >
                  {t.supplier}
                </Text>
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  {t.tariffName}
                </Text>
              </View>

              {t.electricity?.unitRate != null && (
                <Text className="text-sm font-bold text-brand-blue-bright">
                  {t.electricity.unitRate}p
                </Text>
              )}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CalculatorScreen() {
  const { tariffs, isLoadingList, loadTariffs, calculateCost, calculateResult, isCalculating } = useTariffStore();
  const { profile } = useProfileStore();

  const [elecKwh,    setElecKwh]    = React.useState(
    profile?.energy?.annualElectricityKwh?.toString() ?? '2900',
  );
  const [gasKwh,     setGasKwh]     = React.useState(
    profile?.energy?.annualGasKwh?.toString() ?? '11500',
  );
  const [selectedId, setSelectedId] = React.useState('');
  const [error,      setError]      = React.useState('');

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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* ── Page header — always brand navy ──────────────────────── */}
      <View className="bg-brand pt-14">
        <View className="px-5 pb-3.5">
          <Text className="text-xl font-bold text-brand-fg">Tariffs</Text>
          <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
            Calculate exact costs for your usage
          </Text>
        </View>
        <TopTabs active="calculate" />
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Usage inputs card ─────────────────────────────────────── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5 gap-3.5">
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
            Your Annual Usage
          </Text>
          <Text className="text-xs font-sans -mt-1 text-[#4A6A82] dark:text-brand-fg-muted">
            Pre-filled from your profile. Edit to get personalised costs.
          </Text>
          <InputField
            label="⚡ Electricity (kWh/year)"
            value={elecKwh}
            onChangeText={setElecKwh}
            placeholder="e.g. 2900"
            hint="kWh"
          />
          <InputField
            label="🔥 Gas (kWh/year)"
            value={gasKwh}
            onChangeText={setGasKwh}
            placeholder="e.g. 11500"
            hint="kWh"
          />
          {/* UK averages hint */}
          <View className="bg-primary/6 dark:bg-brand rounded-lg p-2.5 flex-row gap-5">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              UK avg: 2,900 kWh elec
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              UK avg: 11,500 kWh gas
            </Text>
          </View>
        </View>

        {/* ── Tariff picker card ────────────────────────────────────── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-1">
            Select Tariff
          </Text>
          <Text className="text-xs font-sans mb-3 text-[#4A6A82] dark:text-brand-fg-muted">
            Showing cheapest fixed dual fuel tariffs. Browse all in the Browse tab.
          </Text>
          {isLoadingList ? (
            <ActivityIndicator color="#2272A6" />
          ) : (
            <TariffPicker
              tariffs={tariffs}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </View>

        {/* Error banner */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            <Text className="text-destructive text-sm font-sans">{error}</Text>
          </View>
        ) : null}

        {/* Calculate button
            h-12 = 48px, rounded-card = 14px  (config tokens)
            disabled → muted bg instead of primary                        */}
        <Pressable
          onPress={handleCalculate}
          disabled={isCalculating || !selectedId}
          className={[
            'h-12 rounded-card items-center justify-center mb-5',
            !selectedId
              ? 'bg-brand-selected dark:bg-brand-selected'
              : 'bg-primary',
            isCalculating ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          {isCalculating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: '#ffffff' }} className="text-base font-bold">
              Calculate Cost
            </Text>
          )}
        </Pressable>

        {/* Result */}
        {calculateResult && !isCalculating && (
          <CostResult result={calculateResult} />
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}