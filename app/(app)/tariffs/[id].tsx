import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const B = { navy: '#0D2C40', blue: '#2272A6', blueBrt: '#3D9DD4', fg: '#F0F8FF', fgMuted: '#7AAEC8' };

function Row({ label, value, highlight, isDark }: {
  label: string; value: string; highlight?: boolean; isDark: boolean;
}) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 10, borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E3A52' : '#E5EDF3',
    }}>
      <Text style={{ color: isDark ? '#7AAEC8' : '#4A6A82', fontSize: 13, fontFamily: 'Poppins' }}>
        {label}
      </Text>
      <Text style={{
        color: highlight ? B.blue : (isDark ? '#F0F8FF' : '#0D2C40'),
        fontSize: 13, fontWeight: highlight ? '700' : '500',
        fontFamily: highlight ? 'Poppins-SemiBold' : 'Poppins',
      }}>{value}</Text>
    </View>
  );
}

function RateBox({ label, value, unit, isDark }: {
  label: string; value: string; unit: string; isDark: boolean;
}) {
  return (
    <View style={{
      flex: 1, backgroundColor: isDark ? '#132030' : '#F0F6FB',
      borderRadius: 12, padding: 14, alignItems: 'center', gap: 4,
      borderWidth: 1, borderColor: isDark ? '#1E3A52' : '#E5EDF3',
    }}>
      <Text style={{ color: B.blueBrt, fontSize: 20, fontWeight: '700',
        fontFamily: 'Poppins-Bold' }}>{value}</Text>
      <Text style={{ color: isDark ? '#7AAEC8' : '#4A6A82', fontSize: 10,
        fontFamily: 'Poppins', textAlign: 'center' }}>{unit}</Text>
      <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 11,
        fontFamily: 'Poppins-SemiBold', marginTop: 2 }}>{label}</Text>
    </View>
  );
}

export default function TariffDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedTariff, isLoadingDetail, loadTariff } = useTariffStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => {
    if (id) loadTariff(id);
  }, [id]);

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  if (isLoadingDetail) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={B.blue} />
      </View>
    );
  }

  if (!selectedTariff) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center',
        justifyContent: 'center', padding: 32, gap: 12 }}>
        <Text style={{ color: textFg, fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>
          Tariff not found
        </Text>
        <Pressable onPress={() => router.back()}
          style={{ backgroundColor: B.blue, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontFamily: 'Poppins-Bold' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const t = selectedTariff;

  // Estimate annual cost at UK average
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
    <View style={{ flex: 1, backgroundColor: bg }}>

      {/* ── Header ── */}
      <View style={{ backgroundColor: B.navy, paddingTop: 56, paddingBottom: 24,
        paddingHorizontal: 20 }}>
        <Pressable onPress={() => router.back()} hitSlop={12}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke={B.fgMuted} strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={{ color: B.fgMuted, fontSize: 14, fontFamily: 'Poppins' }}>Back</Text>
        </Pressable>

        <View style={{ flexDirection: 'row', alignItems: 'flex-start',
          justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              {t.isGreen && (
                <View style={{ backgroundColor: '#22A66020', borderRadius: 6,
                  paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: '#2DD4A0', fontSize: 10, fontWeight: '700' }}>🌿 GREEN</Text>
                </View>
              )}
              <View style={{ backgroundColor: '#2272A620', borderRadius: 6,
                paddingHorizontal: 6, paddingVertical: 2 }}>
                <Text style={{ color: B.blueBrt, fontSize: 10, fontWeight: '700',
                  textTransform: 'uppercase' }}>{t.tariffType}</Text>
              </View>
              {t.isLive && (
                <View style={{ backgroundColor: '#2DD4A015', borderRadius: 6,
                  paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#2DD4A040' }}>
                  <Text style={{ color: '#2DD4A0', fontSize: 9, fontWeight: '700' }}>● LIVE</Text>
                </View>
              )}
            </View>
            <Text style={{ color: B.fg, fontSize: 20, fontWeight: '700',
              fontFamily: 'Poppins-Bold' }}>{t.supplier}</Text>
            <Text style={{ color: B.fgMuted, fontSize: 14, fontFamily: 'Poppins', marginTop: 2 }}>
              {t.tariffName}
            </Text>
          </View>
          {totalCost && (
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: B.fgMuted, fontSize: 11, fontFamily: 'Poppins' }}>Est. annual</Text>
              <Text style={{ color: B.fg, fontSize: 22, fontWeight: '700',
                fontFamily: 'Poppins-Bold' }}>£{totalCost.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}>

        {/* ── Rate boxes ── */}
        {t.electricity?.unitRate && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
              letterSpacing: 0.5, marginBottom: 10 }}>⚡ ELECTRICITY RATES</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <RateBox label="Unit Rate" value={`${t.electricity.unitRate}p`}
                unit="per kWh incl. VAT" isDark={isDark} />
              <RateBox label="Standing Charge" value={`${t.electricity.standingCharge}p`}
                unit="per day incl. VAT" isDark={isDark} />
              {elecCost && (
                <RateBox label="Annual Cost" value={`£${elecCost.toLocaleString()}`}
                  unit="at UK avg 2900kWh" isDark={isDark} />
              )}
            </View>
          </View>
        )}

        {t.gas?.unitRate && (
          <View style={{ marginBottom: 16 }}>
            <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
              letterSpacing: 0.5, marginBottom: 10 }}>🔥 GAS RATES</Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <RateBox label="Unit Rate" value={`${t.gas.unitRate}p`}
                unit="per kWh incl. VAT" isDark={isDark} />
              <RateBox label="Standing Charge" value={`${t.gas.standingCharge}p`}
                unit="per day incl. VAT" isDark={isDark} />
              {gasCost && (
                <RateBox label="Annual Cost" value={`£${gasCost.toLocaleString()}`}
                  unit="at UK avg 11500kWh" isDark={isDark} />
              )}
            </View>
          </View>
        )}

        {/* ── Contract details ── */}
        <View style={{
          backgroundColor: cardBg, borderRadius: 14, padding: 16,
          borderWidth: 1, borderColor: borderC, marginBottom: 12,
        }}>
          <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
            fontFamily: 'Poppins-SemiBold', marginBottom: 4 }}>Contract Details</Text>
          <Row label="Contract length"
            value={t.contractLengthMonths > 0 ? `${t.contractLengthMonths} months` : 'No fixed term'}
            isDark={isDark} />
          <Row label="Exit fee"
            value={t.exitFee > 0 ? `£${t.exitFee} per fuel` : 'No exit fee'}
            isDark={isDark} />
          {t.cashback > 0 && (
            <Row label="Cashback" value={`£${t.cashback}`} highlight isDark={isDark} />
          )}
          <Row label="Smart meter required"
            value={t.smartMeterRequired ? 'Yes' : 'No'} isDark={isDark} />
          <Row label="Fuel type"
            value={t.fuelType.charAt(0).toUpperCase() + t.fuelType.slice(1)}
            isDark={isDark} />
          <Row label="Data source"
            value={t.isLive ? 'Live — Octopus API' : 'Ofgem cap rate'}
            highlight={!!t.isLive} isDark={isDark} />
          {t.lastUpdated && (
            <Row label="Last updated"
              value={new Date(t.lastUpdated).toLocaleDateString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
              isDark={isDark} />
          )}
        </View>

        {/* ── Features ── */}
        {t.features && t.features.length > 0 && (
          <View style={{
            backgroundColor: cardBg, borderRadius: 14, padding: 16,
            borderWidth: 1, borderColor: borderC, marginBottom: 12,
          }}>
            <Text style={{ color: textFg, fontSize: 14, fontWeight: '600',
              fontFamily: 'Poppins-SemiBold', marginBottom: 12 }}>What's included</Text>
            {t.features.map((f, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start',
                gap: 10, paddingVertical: 5 }}>
                <View style={{ width: 18, height: 18, borderRadius: 9,
                  backgroundColor: '#2272A620', alignItems: 'center',
                  justifyContent: 'center', marginTop: 1 }}>
                  <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <Path d="M2 5l2 2 4-4" stroke={B.blue} strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                </View>
                <Text style={{ color: isDark ? '#D9E8F5' : '#2C3E50', fontSize: 13,
                  fontFamily: 'Poppins', flex: 1, lineHeight: 20 }}>{f}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Disclaimer ── */}
        <View style={{
          backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 10, padding: 12,
          borderWidth: 1, borderColor: borderC,
        }}>
          <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins', lineHeight: 17 }}>
            {t.isLive
              ? '✓ Rates sourced live from Octopus Energy API and include VAT. Actual bills may vary based on usage.'
              : '⚠ Rates based on Ofgem price cap and supplier discount estimates. Verify with supplier before switching.'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
