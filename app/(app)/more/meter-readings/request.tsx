/**
 * Request Meter Reading Screen
 *
 * Client fills in fuel type, request type, optional date range,
 * optional meter IDs override (auto-filled from profile), and notes.
 * Submits to POST /api/meter-readings.
 */

import { Text } from '@/components/ui/text';
import { useMeterReadingStore } from '@/lib/store/meter.store';
import { useProfileStore } from '@/lib/store/profile.store';
import type { MeterFuelType, MeterRequestType } from '@/lib/types/meter.types';
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
import Svg, { Path } from 'react-native-svg';

// ─── Selection chip ────────────────────────────────────────────────

function SelectChip({
  label,
  icon,
  selected,
  onSelect,
  sub,
}: {
  label:    string;
  icon:     string;
  selected: boolean;
  onSelect: () => void;
  sub?:     string;
}) {
  return (
    <Pressable onPress={onSelect} className="flex-1">
      <View
        className={[
          'p-3.5 rounded-card border items-center gap-1.5',
          selected
            ? 'border-primary bg-primary/8 dark:bg-brand-selected/20'
            : 'border-border bg-card',
        ].join(' ')}
        style={{ borderWidth: selected ? 1.5 : 1 }}
      >
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <Text className={`text-sm font-semibold text-center ${selected ? 'text-primary' : 'text-brand dark:text-brand-fg'}`}>
          {label}
        </Text>
        {sub && (
          <Text className="text-xs font-sans text-center text-[#4A6A82] dark:text-brand-fg-muted leading-4">
            {sub}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

// ─── Inline text field ─────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, hint, keyboardType = 'default', multiline,
}: {
  label:          string;
  value:          string;
  onChangeText:   (v: string) => void;
  placeholder?:   string;
  hint?:          string;
  keyboardType?:  any;
  multiline?:     boolean;
}) {
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-sm font-semibold text-brand dark:text-brand-fg">{label}</Text>
        {hint && (
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">{hint}</Text>
        )}
      </View>
      <View className="bg-background dark:bg-card/50 border border-border rounded-banner overflow-hidden">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0B4C0"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={{
            padding: 12,
            fontSize: 14,
            fontFamily: 'Poppins',
            color: textColor,
            minHeight: multiline ? 72 : undefined,
          }}
        />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function RequestMeterReadingScreen() {
  const { requestReading, isRequesting } = useMeterReadingStore();
  const { profile } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';

  // Fuel type — default based on profile
  const [fuelType, setFuelType] = React.useState<MeterFuelType>(
    profile?.energy?.mpan && profile?.energy?.mprn ? 'both' :
    profile?.energy?.mpan ? 'electricity' :
    profile?.energy?.mprn ? 'gas' : 'electricity'
  );

  const [requestType, setRequestType] = React.useState<MeterRequestType>('current_usage');

  // Meter IDs (pre-filled from profile)
  const [mpan, setMpan] = React.useState(profile?.energy?.mpan ?? '');
  const [mprn, setMprn] = React.useState(profile?.energy?.mprn ?? '');

  // Historical dates
  const [periodFrom, setPeriodFrom] = React.useState('');
  const [periodTo,   setPeriodTo]   = React.useState('');

  const [notes, setNotes] = React.useState('');
  const [error, setError] = React.useState('');

  const needsElec = fuelType === 'electricity' || fuelType === 'both';
  const needsGas  = fuelType === 'gas'         || fuelType === 'both';

  const handleSubmit = async () => {
    setError('');

    if (needsElec && !mpan.trim()) {
      setError('Please enter your MPAN (electricity meter number) or add it in your profile first.');
      return;
    }
    if (needsGas && !mprn.trim()) {
      setError('Please enter your MPRN (gas meter number) or add it in your profile first.');
      return;
    }
    if (requestType === 'historical') {
      if (!periodFrom.trim() || !periodTo.trim()) {
        setError('Please enter both start and end dates for historical data.');
        return;
      }
    }

    try {
      const payload: any = {
        fuelType,
        requestType,
        mpan:  needsElec ? mpan.trim()  : undefined,
        mprn:  needsGas  ? mprn.trim()  : undefined,
        clientNotes: notes.trim() || undefined,
      };

      if (requestType === 'historical') {
        // Convert dd/mm/yyyy to ISO
        const parseDate = (s: string) => {
          const [d, m, y] = s.trim().split('/');
          if (!d || !m || !y) return null;
          return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T00:00:00.000Z`).toISOString();
        };
        const from = parseDate(periodFrom);
        const to   = parseDate(periodTo);
        if (!from || !to) {
          setError('Invalid date format. Please use DD/MM/YYYY.');
          return;
        }
        payload.periodFrom = from;
        payload.periodTo   = to;
      }

      const reading = await requestReading(payload);
      router.replace(`/(app)/more/meter-readings/${reading._id}` as any);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Meter Readings</Text>
        </Pressable>
        <Text className="text-xl font-bold text-brand-fg">Request Meter Data</Text>
        <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
          Our team will manually retrieve your consumption data
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Fuel type ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            Which fuel do you need data for?
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
            Select the energy type(s) you want consumption data for.
          </Text>
          <View className="flex-row gap-2.5">
            <SelectChip
              label="Electricity"  icon="⚡"
              selected={fuelType === 'electricity'}
              onSelect={() => setFuelType('electricity')}
              sub="MPAN required"
            />
            <SelectChip
              label="Gas"  icon="🔥"
              selected={fuelType === 'gas'}
              onSelect={() => setFuelType('gas')}
              sub="MPRN required"
            />
            <SelectChip
              label="Both"  icon="⚡🔥"
              selected={fuelType === 'both'}
              onSelect={() => setFuelType('both')}
              sub="Dual fuel"
            />
          </View>
        </View>

        {/* ── Request type ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            What type of data do you need?
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
            Choose based on what you want to know.
          </Text>
          <View className="flex-row gap-2.5">
            <SelectChip
              label="Current"      icon="📊"
              selected={requestType === 'current_usage'}
              onSelect={() => setRequestType('current_usage')}
              sub="Latest available"
            />
            <SelectChip
              label="Historical"   icon="📅"
              selected={requestType === 'historical'}
              onSelect={() => setRequestType('historical')}
              sub="Date range"
            />
            <SelectChip
              label="Annual Est."  icon="📈"
              selected={requestType === 'annual_estimate'}
              onSelect={() => setRequestType('annual_estimate')}
              sub="12-month est."
            />
          </View>
        </View>

        {/* ── Historical dates ── */}
        {requestType === 'historical' && (
          <View className="bg-card rounded-card p-4 border border-border mb-3.5 gap-3">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg">
              📅 Date Range
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted -mt-1">
              Format: DD/MM/YYYY (e.g. 01/01/2025)
            </Text>
            <Field
              label="From"
              value={periodFrom}
              onChangeText={setPeriodFrom}
              placeholder="01/01/2025"
              keyboardType="numbers-and-punctuation"
            />
            <Field
              label="To"
              value={periodTo}
              onChangeText={setPeriodTo}
              placeholder="31/12/2025"
              keyboardType="numbers-and-punctuation"
            />
          </View>
        )}

        {/* ── Meter IDs ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5 gap-3">
          <View className="flex-row items-center justify-between mb-0.5">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg">
              Meter Numbers
            </Text>
            <Pressable onPress={() => router.push('/(profile-setup)/step-4' as any)}>
              <Text className="text-xs font-semibold text-primary">Edit in profile →</Text>
            </Pressable>
          </View>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted -mt-1">
            Pre-filled from your profile. Edit here to override for this request only.
          </Text>

          {(fuelType === 'electricity' || fuelType === 'both') && (
            <Field
              label="⚡ MPAN (Electricity)"
              value={mpan}
              onChangeText={setMpan}
              placeholder="1900012345678"
              keyboardType="numeric"
              hint={mpan ? '✓ from profile' : '(required)'}
            />
          )}
          {(fuelType === 'gas' || fuelType === 'both') && (
            <Field
              label="🔥 MPRN (Gas)"
              value={mprn}
              onChangeText={setMprn}
              placeholder="1234567"
              keyboardType="numeric"
              hint={mprn ? '✓ from profile' : '(required)'}
            />
          )}
        </View>

        {/* ── Notes ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            Additional Notes (optional)
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
            Any context that might help — e.g. new premises, change of supplier, etc.
          </Text>
          <View className="bg-background dark:bg-card/50 border border-border rounded-banner overflow-hidden">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. I recently moved to this property in Jan 2025. Looking for usage since then."
              placeholderTextColor="#A0B4C0"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ padding: 12, fontSize: 14, fontFamily: 'Poppins', color: textColor, minHeight: 72 }}
            />
          </View>
        </View>

        {/* ── What happens next ── */}
        <View className="bg-primary/8 rounded-card p-4 border border-primary/20 mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2.5">
            📋 What happens next?
          </Text>
          {[
            { step: '1', text: 'Your request is submitted to our team' },
            { step: '2', text: 'We access the DCC or supplier portal using your meter IDs' },
            { step: '3', text: 'We retrieve and verify your consumption data' },
            { step: '4', text: 'Data appears in your app — usually within a few hours' },
            { step: '5', text: 'Your profile usage figures are automatically updated' },
          ].map((item) => (
            <View key={item.step} className="flex-row items-start gap-2.5 mb-2">
              <View className="w-5 h-5 rounded-full bg-primary/15 border border-primary/25 items-center justify-center mt-0.5 flex-shrink-0">
                <Text className="text-xs font-bold text-primary">{item.step}</Text>
              </View>
              <Text className="text-sm font-sans flex-1 leading-5 text-brand dark:text-brand-fg">
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* ── Error ── */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            <Text className="text-destructive text-sm font-sans">{error}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* ── CTA ── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border">
        <Pressable
          onPress={handleSubmit}
          disabled={isRequesting}
          className={[
            'bg-primary h-14 rounded-card items-center justify-center flex-row gap-2',
            isRequesting ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          {isRequesting ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                Submitting…
              </Text>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 18 }}>📡</Text>
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                Request Meter Data
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}