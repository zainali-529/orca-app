import { SetupHeader } from '@/components/shared/setup-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const TARIFF_TYPES = [
  { id: 'fixed',    label: 'Fixed'    },
  { id: 'variable', label: 'Variable' },
  { id: 'flexible', label: 'Flexible' },
  { id: 'unknown',  label: 'Not sure' },
];

function SectionToggle({ label, icon, enabled, onToggle, isDark }: {
  label: string; icon: string; enabled: boolean; onToggle: () => void; isDark: boolean;
}) {
  return (
    <Pressable onPress={onToggle}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: 14, borderRadius: 12,
        backgroundColor: enabled
          ? isDark ? '#1A3A54' : '#EDF5FB'
          : isDark ? '#132030' : '#FFFFFF',
        borderWidth: 1,
        borderColor: enabled ? '#2272A6' : isDark ? '#1E3A52' : '#E5EDF3',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 18 }}>{icon}</Text>
          <Text style={{
            color: enabled ? '#2272A6' : isDark ? '#F0F8FF' : '#0D2C40',
            fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold',
          }}>{label}</Text>
        </View>
        <View style={{
          width: 22, height: 22, borderRadius: 11,
          backgroundColor: enabled ? '#2272A6' : 'transparent',
          borderWidth: enabled ? 0 : 1.5,
          borderColor: isDark ? '#1E3A52' : '#C8DCE9',
          alignItems: 'center', justifyContent: 'center',
        }}>
          {enabled && (
            <Svg width="12" height="12" viewBox="0 0 12 12">
              <Path d="M2 6l3 3 5-5" fill="none" stroke="#fff"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function TariffChips({ selected, onSelect, isDark }: {
  selected: string; onSelect: (v: string) => void; isDark: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {TARIFF_TYPES.map((t) => (
        <Pressable key={t.id} onPress={() => onSelect(t.id)}>
          <View style={{
            paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
            borderWidth: 1,
            borderColor: selected === t.id ? '#2272A6' : isDark ? '#1E3A52' : '#D5DEE8',
            backgroundColor: selected === t.id
              ? isDark ? '#1A3A54' : '#EDF5FB'
              : isDark ? '#0D2C40' : '#F8FAFC',
          }}>
            <Text style={{
              fontSize: 13,
              color: selected === t.id ? '#2272A6' : isDark ? '#7AAEC8' : '#4A6A82',
              fontFamily: 'Poppins',
            }}>{t.label}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

export default function Step4Screen() {
  const { saveStep4, isLoading } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';
  const inputFg = isDark ? '#F0F8FF' : '#0D2C40';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SetupHeader
        currentStep={4}
        totalSteps={5}
        title="Your energy details"
        subtitle="We need your meter info to compare the best UK tariffs."
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={{ gap: 8, marginBottom: 16 }}>
          <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
            letterSpacing: 0.5, marginBottom: 4 }}>SELECT ENERGY TYPE</Text>
          <SectionToggle label="Electricity" icon="⚡" enabled={hasElec}
            onToggle={() => setHasElec(!hasElec)} isDark={isDark} />
          <SectionToggle label="Gas" icon="🔥" enabled={hasGas}
            onToggle={() => setHasGas(!hasGas)} isDark={isDark} />
        </View>

        {hasElec && (
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 20,
            marginBottom: 12, borderWidth: 1, borderColor: borderC, gap: 14,
          }}>
            <Text style={{ color: inputFg, fontSize: 13, fontWeight: '600',
              fontFamily: 'Poppins-SemiBold' }}>Electricity Details</Text>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Label>MPAN</Label>
                <Text style={{ color: '#E24B4A', fontSize: 12 }}>*</Text>
                <Text style={{ color: mutedFg, fontSize: 11 }}>(13-digit meter number)</Text>
              </View>
              <Input placeholder="1900012345678" keyboardType="numeric" maxLength={13}
                value={mpan} onChangeText={setMpan}
                className={error.includes('MPAN') ? 'border-destructive' : ''} />
            </View>

            <View style={{ gap: 6 }}>
              <Label>Current supplier</Label>
              <Input placeholder="e.g. British Gas" value={elecSup} onChangeText={setElecSup} />
            </View>

            <View style={{ gap: 6 }}>
              <Label>Annual usage (kWh)</Label>
              <Input placeholder="e.g. 25000" keyboardType="numeric"
                value={elecKwh} onChangeText={setElecKwh} />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Tariff type</Label>
              <TariffChips selected={elecTariff} onSelect={setElecTariff} isDark={isDark} />
            </View>
          </View>
        )}

        {hasGas && (
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 20,
            marginBottom: 12, borderWidth: 1, borderColor: borderC, gap: 14,
          }}>
            <Text style={{ color: inputFg, fontSize: 13, fontWeight: '600',
              fontFamily: 'Poppins-SemiBold' }}>Gas Details</Text>

            <View style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Label>MPRN</Label>
                <Text style={{ color: '#E24B4A', fontSize: 12 }}>*</Text>
                <Text style={{ color: mutedFg, fontSize: 11 }}>(6-10 digit meter number)</Text>
              </View>
              <Input placeholder="1234567" keyboardType="numeric" maxLength={10}
                value={mprn} onChangeText={setMprn}
                className={error.includes('MPRN') ? 'border-destructive' : ''} />
            </View>

            <View style={{ gap: 6 }}>
              <Label>Current supplier</Label>
              <Input placeholder="e.g. British Gas" value={gasSup} onChangeText={setGasSup} />
            </View>

            <View style={{ gap: 6 }}>
              <Label>Annual usage (kWh)</Label>
              <Input placeholder="e.g. 18000" keyboardType="numeric"
                value={gasKwh} onChangeText={setGasKwh} />
            </View>

            <View style={{ gap: 8 }}>
              <Label>Tariff type</Label>
              <TariffChips selected={gasTariff} onSelect={setGasTariff} isDark={isDark} />
            </View>
          </View>
        )}

        <Pressable
          onPress={() => setHasSmart(!hasSmart)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 14,
            padding: 14, borderRadius: 12,
            backgroundColor: cardBg, borderWidth: 1, borderColor: borderC,
          }}>
          <Text style={{ fontSize: 20 }}>📡</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: inputFg, fontSize: 14, fontFamily: 'Poppins-SemiBold' }}>
              I have a smart meter
            </Text>
            <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins', marginTop: 2 }}>
              Enables automatic reading collection
            </Text>
          </View>
          <View style={{
            width: 22, height: 22, borderRadius: 11,
            backgroundColor: hasSmart ? '#2272A6' : 'transparent',
            borderWidth: hasSmart ? 0 : 1.5,
            borderColor: isDark ? '#1E3A52' : '#C8DCE9',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {hasSmart && (
              <Svg width="12" height="12" viewBox="0 0 12 12">
                <Path d="M2 6l3 3 5-5" fill="none" stroke="#fff"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </View>
        </Pressable>
      </ScrollView>

      {/* ── Fixed bottom button ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: bg,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: isDark ? '#1E3A52' : '#E2EAF0', zIndex: 100,
      }}>
        {error ? (
          <View style={{
            backgroundColor: '#E24B4A15', borderRadius: 10,
            padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E24B4A30',
          }}>
            <Text style={{ color: '#E24B4A', fontSize: 13 }}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={handleContinue}
          disabled={isLoading}
          style={{ backgroundColor: '#2272A6', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
