import { SetupHeader } from '@/components/shared/setup-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TARIFF_TYPES = [
  { id: 'fixed',    label: 'Fixed'    },
  { id: 'variable', label: 'Variable' },
  { id: 'flexible', label: 'Flexible' },
  { id: 'unknown',  label: 'Not sure' },
];

// ─── Section toggle row (Electricity / Gas) ───────────────────────────────────

function SectionToggle({
  label,
  icon,
  enabled,
  onToggle,
}: {
  label: string;
  icon: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle}>
      {/* p-3.5 = 14px  (Tailwind default › 3.5 × 4px) */}
      <View
        className={[
          'flex-row items-center justify-between p-3.5 rounded-xl border',
          enabled
            ? 'border-primary bg-primary/7 dark:bg-brand-selected/15'
            : 'border-border bg-card',
        ].join(' ')}
      >
        {/* Icon + label */}
        <View className="flex-row items-center gap-2.5">
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          {/* text-sm = 14px / 20px lh  (config › fontSize.sm) */}
          <Text
            className={[
              'text-sm font-semibold',
              enabled ? 'text-primary' : 'text-brand dark:text-brand-fg',
            ].join(' ')}
          >
            {label}
          </Text>
        </View>

        {/* Check circle
            w-5.5 h-5.5 = 22px  (config › spacing.5.5)
            borderWidth 1.5 unchecked — kept as style prop                */}
        <View
          className={[
            'w-5.5 h-5.5 rounded-full items-center justify-center',
            enabled ? 'bg-primary' : 'border-border',
          ].join(' ')}
          style={{ borderWidth: enabled ? 0 : 1.5 }}
        >
          {enabled && (
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
      </View>
    </Pressable>
  );
}

// ─── Tariff type chips ────────────────────────────────────────────────────────

function TariffChips({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (v: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {TARIFF_TYPES.map((t) => {
        const isSelected = selected === t.id;
        return (
          <Pressable key={t.id} onPress={() => onSelect(t.id)}>
            {/* px-3.5 = 14px  (Tailwind default › 3.5 × 4px)
                bg-primary/7 = 7% opacity  (config › opacity.7)
                dark:bg-brand-selected = #1A3A54  (config › brand.selected) */}
            <View
              className={[
                'px-3.5 py-2 rounded-full border',
                isSelected
                  ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
                  : 'border-border bg-card'
              ].join(' ')}
            >
              {/* text-sm = 13px / 18px lh  (config › fontSize.13) */}
              <Text
                className={[
                  'text-sm font-sans',
                  isSelected
                    ? 'text-primary'
                    : 'text-[#4A6A82] dark:text-brand-fg-muted',
                ].join(' ')}
              >
                {t.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Step4Screen() {
  const { saveStep4, isLoading } = useProfileStore();

  const [hasElec,  setHasElec]  = React.useState(true);
  const [hasGas,   setHasGas]   = React.useState(false);
  const [hasSmart, setHasSmart] = React.useState(false);

  const [mpan,       setMpan]       = React.useState('');
  const [elecSup,    setElecSup]    = React.useState('');
  const [elecKwh,    setElecKwh]    = React.useState('');
  const [elecTariff, setElecTariff] = React.useState('unknown');

  const [mprn,      setMprn]      = React.useState('');
  const [gasSup,    setGasSup]    = React.useState('');
  const [gasKwh,    setGasKwh]    = React.useState('');
  const [gasTariff, setGasTariff] = React.useState('unknown');

  const [error, setError] = React.useState('');

  const handleContinue = async () => {
    if (!hasElec && !hasGas) {
      setError('Please select at least electricity or gas'); return;
    }
    if (hasElec && !mpan) {
      setError('MPAN is required for electricity'); return;
    }
    if (hasGas && !mprn) {
      setError('MPRN is required for gas'); return;
    }
    setError('');
    try {
      await saveStep4({
        ...(hasElec && {
          mpan,
          currentElectricitySupplier: elecSup || undefined,
          annualElectricityKwh:       elecKwh ? Number(elecKwh) : undefined,
          electricityTariffType:      elecTariff,
        }),
        ...(hasGas && {
          mprn,
          currentGasSupplier: gasSup || undefined,
          annualGasKwh:       gasKwh ? Number(gasKwh) : undefined,
          gasTariffType:      gasTariff,
        }),
        hasSmartMeter: hasSmart,
      });
      router.push('/(profile-setup)/step-5');
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 bg-background">

      <SetupHeader
        currentStep={4}
        totalSteps={5}
        title="Your energy details"
        subtitle="We need your meter info to compare the best UK tariffs."
        onBack={() => router.back()}
      />

      {/* ── Scrollable form ─────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Energy type toggles ──────────────────────────────────────── */}
        <View className="gap-2 mb-4">
          {/* text-xs = 11px / 14px lh  (config › fontSize.11)
              tracking-[0.5px] — no standard step, kept as arbitrary       */}
          <Text className="text-xs tracking-[0.5px] mb-1 text-[#4A6A82] dark:text-brand-fg-muted font-sans">
            SELECT ENERGY TYPE
          </Text>
          <SectionToggle
            label="Electricity"
            icon="⚡"
            enabled={hasElec}
            onToggle={() => setHasElec(!hasElec)}
          />
          <SectionToggle
            label="Gas"
            icon="🔥"
            enabled={hasGas}
            onToggle={() => setHasGas(!hasGas)}
          />
        </View>

        {/* ── Electricity details card ─────────────────────────────────── */}
        {hasElec && (
          <View className="bg-card rounded-2xl p-5 mb-3 border border-border gap-3.5">
            {/* text-sm = 13px / 18px lh  (config › fontSize.13) */}
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
              Electricity Details
            </Text>

            {/* MPAN (required) */}
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <Label>MPAN</Label>
                <Text className="text-destructive text-xs">*</Text>
                {/* text-xs = 11px  (config › fontSize.11) */}
                <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
                  (13-digit meter number)
                </Text>
              </View>
              <Input
                placeholder="1900012345678"
                keyboardType="numeric"
                maxLength={13}
                value={mpan}
                onChangeText={setMpan}
                className={error.includes('MPAN') ? 'border-destructive' : ''}
              />
            </View>

            {/* Current supplier */}
            <View className="gap-1.5">
              <Label>Current supplier</Label>
              <Input
                placeholder="e.g. British Gas"
                value={elecSup}
                onChangeText={setElecSup}
              />
            </View>

            {/* Annual usage */}
            <View className="gap-1.5">
              <Label>Annual usage (kWh)</Label>
              <Input
                placeholder="e.g. 25000"
                keyboardType="numeric"
                value={elecKwh}
                onChangeText={setElecKwh}
              />
            </View>

            {/* Tariff type chips */}
            <View className="gap-2">
              <Label>Tariff type</Label>
              <TariffChips selected={elecTariff} onSelect={setElecTariff} />
            </View>
          </View>
        )}

        {/* ── Gas details card ─────────────────────────────────────────── */}
        {hasGas && (
          <View className="bg-card rounded-2xl p-5 mb-3 border border-border gap-3.5">
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
              Gas Details
            </Text>

            {/* MPRN (required) */}
            <View className="gap-1.5">
              <View className="flex-row items-center gap-1.5">
                <Label>MPRN</Label>
                <Text className="text-destructive text-xs">*</Text>
                <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
                  (6-10 digit meter number)
                </Text>
              </View>
              <Input
                placeholder="1234567"
                keyboardType="numeric"
                maxLength={10}
                value={mprn}
                onChangeText={setMprn}
                className={error.includes('MPRN') ? 'border-destructive' : ''}
              />
            </View>

            {/* Current supplier */}
            <View className="gap-1.5">
              <Label>Current supplier</Label>
              <Input
                placeholder="e.g. British Gas"
                value={gasSup}
                onChangeText={setGasSup}
              />
            </View>

            {/* Annual usage */}
            <View className="gap-1.5">
              <Label>Annual usage (kWh)</Label>
              <Input
                placeholder="e.g. 18000"
                keyboardType="numeric"
                value={gasKwh}
                onChangeText={setGasKwh}
              />
            </View>

            {/* Tariff type chips */}
            <View className="gap-2">
              <Label>Tariff type</Label>
              <TariffChips selected={gasTariff} onSelect={setGasTariff} />
            </View>
          </View>
        )}

        {/* ── Smart meter toggle row ────────────────────────────────────── */}
        {/* p-3.5 = 14px, gap-3.5 = 14px  (Tailwind default › 3.5 × 4px) */}
        <Pressable
          onPress={() => setHasSmart(!hasSmart)}
          className="flex-row items-center gap-3.5 p-3.5 rounded-xl bg-card border border-border"
        >
          <Text style={{ fontSize: 20 }}>📡</Text>

          <View className="flex-1">
            {/* text-sm = 14px  (config › fontSize.sm) */}
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
              I have a smart meter
            </Text>
            {/* text-xs = 12px  (config › fontSize.xs) */}
            <Text className="text-xs mt-0.5 font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Enables automatic reading collection
            </Text>
          </View>

          {/* Check circle
              w-5.5 h-5.5 = 22px  (config › spacing.5.5)
              borderWidth 1.5 unchecked — kept as style prop                */}
          <View
            className={[
              'w-5.5 h-5.5 rounded-full items-center justify-center',
              hasSmart ? 'bg-primary' : 'border-border',
            ].join(' ')}
            style={{ borderWidth: hasSmart ? 0 : 1.5 }}
          >
            {hasSmart && (
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
        </Pressable>

      </ScrollView>

      {/* ── Fixed bottom bar ──────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border z-50">

        {/* Error banner
            bg-destructive/8 = 8% opacity  (config › opacity.8)
            rounded-banner   = 10px        (config › borderRadius.banner) */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            <Text className="text-destructive text-sm font-sans">
              {error}
            </Text>
          </View>
        ) : null}

        {/* CTA button
            h-12         = 48px  (Tailwind default › 12 × 4px)
            rounded-card = 14px  (config › borderRadius.card)
            style color  = white forced — custom Text component fix        */}
        <Pressable
          onPress={handleContinue}
          disabled={isLoading}
          className={[
            'bg-primary h-12 rounded-card items-center justify-center',
            isLoading ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          <Text style={{ color: '#ffffff' }} className="text-base font-bold">
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>

      </View>
    </View>
  );
}