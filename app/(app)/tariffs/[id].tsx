import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Row ─────────────────────────────────────────────────────────────────────

function Row({ label, value, highlight }: {
  label: string; value: string; highlight?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-center py-2.5 border-b border-border">
      <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
        {label}
      </Text>
      <Text
        className={[
          'text-sm',
          highlight
            ? 'font-semibold text-primary'
            : 'font-medium text-brand dark:text-brand-fg',
        ].join(' ')}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Rate box ─────────────────────────────────────────────────────────────────

function RateBox({ label, value, unit }: {
  label: string; value: string; unit: string;
}) {
  return (
    <View className="flex-1 bg-primary/6 dark:bg-brand-selected/20 rounded-xl p-2.5 items-center gap-1 border border-border">
      {/* text-xl = 20px — rate value */}
      <Text className="text-xl font-bold text-brand-blue-bright">
        {value}
      </Text>
      <Text className="text-xs font-sans text-center text-[#4A6A82] dark:text-brand-fg-muted">
        {unit}
      </Text>
      <Text className="text-[11px] font-semibold mt-0.5 text-brand dark:text-brand-fg">
        {label}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function TariffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedTariff, isLoadingDetail, loadTariff } = useTariffStore();

  React.useEffect(() => {
    if (id) loadTariff(id);
  }, [id]);

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!selectedTariff) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">
          Tariff not found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-primary rounded-banner px-5 py-2.5"
        >
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const t = selectedTariff;

  const UK_AVG_ELEC = 2900;
  const UK_AVG_GAS  = 11500;
  const elecCost = t.electricity?.unitRate
    ? Math.round((t.electricity.unitRate / 100) * UK_AVG_ELEC + (t.electricity.standingCharge! / 100) * 365)
    : null;
  const gasCost = t.gas?.unitRate
    ? Math.round((t.gas.unitRate / 100) * UK_AVG_GAS + (t.gas.standingCharge! / 100) * 365)
    : null;
  const totalCost = (elecCost ?? 0) + (gasCost ?? 0) || null;

  return (
    <View className="flex-1 bg-background">

      {/* ── Header — always brand navy ────────────────────────────────── */}
      {/* pt-14 = 56px, pb-6 = 24px  (Tailwind defaults) */}
      <View className="bg-brand pt-14 pb-6 px-5">

        {/* Back button */}
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="flex-row items-center gap-1.5 mb-4"
        >
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 18l-6-6 6-6"
              stroke="#7AAEC8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Back</Text>
        </Pressable>

        {/* Supplier info + annual cost */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1">

            {/* Badges row */}
            <View className="flex-row items-center gap-2 mb-1">
              {t.isGreen && (
                <View className="bg-brand-green/10 rounded-md px-1.5 py-0.5">
                  <Text className="text-xs font-bold text-brand-teal">🌿 GREEN</Text>
                </View>
              )}
              <View className="bg-primary/13 rounded-md px-1.5 py-0.5">
                <Text className="text-xs font-bold text-brand-blue-bright uppercase">
                  {t.tariffType}
                </Text>
              </View>
              {t.isLive && (
                <View className="bg-brand-teal/8 rounded-md px-1.5 py-0.5 border border-brand-teal/25">
                  <Text className="text-xs font-bold text-brand-teal">● LIVE</Text>
                </View>
              )}
            </View>

            {/* text-xl = 20px — supplier name */}
            <Text className="text-xl font-bold text-brand-fg">
              {t.supplier}
            </Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {t.tariffName}
            </Text>
          </View>

          {/* Estimated annual cost */}
          {totalCost && (
            <View className="items-end">
              <Text className="text-xs font-sans text-brand-fg-muted">Est. annual</Text>
              {/* text-xl = 20px — original was 22px, closest default */}
              <Text className="text-xl font-bold text-brand-fg">
                £{totalCost.toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* ── Scrollable content ───────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Electricity rates ─────────────────────────────────────── */}
        {t.electricity?.unitRate && (
          <View className="mb-3">
            <Text className="text-xs font-sans tracking-[0.5px] mb-2.5 text-[#4A6A82] dark:text-brand-fg-muted">
              ⚡ ELECTRICITY RATES
            </Text>
            <View className="flex-row gap-2.5">
              <RateBox
                label="Unit Rate"
                value={`${t.electricity.unitRate}p`}
                unit="per kWh incl. VAT"
              />
              <RateBox
                label="Standing Charge"
                value={`${t.electricity.standingCharge}p`}
                unit="per day incl. VAT"
              />
              {elecCost && (
                <RateBox
                  label="Annual Cost"
                  value={`£${elecCost.toLocaleString()}`}
                  unit="at UK avg 2900kWh"
                />
              )}
            </View>
          </View>
        )}

        {/* ── Gas rates ─────────────────────────────────────────────── */}
        {t.gas?.unitRate && (
          <View className="mb-4">
            <Text className="text-xs font-sans tracking-[0.5px] mb-2.5 text-[#4A6A82] dark:text-brand-fg-muted">
              🔥 GAS RATES
            </Text>
            <View className="flex-row gap-2.5">
              <RateBox
                label="Unit Rate"
                value={`${t.gas.unitRate}p`}
                unit="per kWh incl. VAT"
              />
              <RateBox
                label="Standing Charge"
                value={`${t.gas.standingCharge}p`}
                unit="per day incl. VAT"
              />
              {gasCost && (
                <RateBox
                  label="Annual Cost"
                  value={`£${gasCost.toLocaleString()}`}
                  unit="at UK avg 11500kWh"
                />
              )}
            </View>
          </View>
        )}

        {/* ── Contract details card ─────────────────────────────────── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3">
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-1">
            Contract Details
          </Text>
          <Row
            label="Contract length"
            value={t.contractLengthMonths > 0 ? `${t.contractLengthMonths} months` : 'No fixed term'}
          />
          <Row
            label="Exit fee"
            value={t.exitFee > 0 ? `£${t.exitFee} per fuel` : 'No exit fee'}
          />
          {t.cashback > 0 && (
            <Row label="Cashback" value={`£${t.cashback}`} highlight />
          )}
          <Row
            label="Smart meter required"
            value={t.smartMeterRequired ? 'Yes' : 'No'}
          />
          <Row
            label="Fuel type"
            value={t.fuelType.charAt(0).toUpperCase() + t.fuelType.slice(1)}
          />
          <Row
            label="Data source"
            value={t.isLive ? 'Live — Octopus API' : 'Ofgem cap rate'}
            highlight={!!t.isLive}
          />
          {t.lastUpdated && (
            <Row
              label="Last updated"
              value={new Date(t.lastUpdated).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            />
          )}
        </View>

        {/* ── Features card ─────────────────────────────────────────── */}
        {t.features && t.features.length > 0 && (
          <View className="bg-card rounded-card p-4 border border-border mb-3">
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-3">
              What's included
            </Text>
            {t.features.map((f, i) => (
              <View key={i} className="flex-row items-start gap-2.5 py-1">
                {/* Check circle — w-4.5 h-4.5 = 18px closest is w-5 (20px), use style */}
                <View
                  className="bg-primary/13 rounded-full items-center justify-center mt-0.5"
                  style={{ width: 18, height: 18 }}
                >
                  <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <Path
                      d="M2 5l2 2 4-4"
                      stroke="#2272A6"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
                <Text className="text-sm font-sans flex-1 leading-5 text-brand dark:text-brand-fg">
                  {f}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Disclaimer ────────────────────────────────────────────── */}
        <View className="bg-primary/6 dark:bg-brand-selected rounded-banner p-3 border border-border">
          <Text className="text-xs font-sans leading-[17px] text-[#4A6A82] dark:text-brand-fg-muted">
            {t.isLive
              ? '✓ Rates sourced live from Octopus Energy API and include VAT. Actual bills may vary based on usage.'
              : '⚠ Rates based on Ofgem price cap and supplier discount estimates. Verify with supplier before switching.'}
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}