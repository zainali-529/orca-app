import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';
import Svg, { Path, Polygon } from 'react-native-svg';

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

function StarRating({ rating, size = 12 }: { rating: number | null | undefined; size?: number }) {
  if (!rating) return null;
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <Svg key={s} width={size} height={size} viewBox="0 0 24 24">
          <Polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill={s <= Math.round(rating) ? '#F59E0B' : 'transparent'}
            stroke="#F59E0B" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
          />
        </Svg>
      ))}
    </View>
  );
}

const SUPPLIER_EMOJIS: Record<string, string> = {
  'Octopus Energy':   '🐙',
  'British Gas':      '🔵',
  'EDF Energy':       '⚛️',
  'E.ON Next':        '🔆',
  'Scottish Power':   '⚡',
  'Ovo Energy':       '🍃',
  'Shell Energy':     '🐚',
  'So Energy':        '🌟',
  'Utility Warehouse':'🏠',
};

export default function SuppliersScreen() {
  const { suppliers, isLoadingSuppliers, loadSuppliers } = useTariffStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  React.useEffect(() => { loadSuppliers(); }, []);

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  const sorted = [...suppliers].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ backgroundColor: B.navy, paddingTop: 56, paddingBottom: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={{ color: B.fg, fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            Tariffs
          </Text>
          <Text style={{ color: B.fgMuted, fontSize: 13, fontFamily: 'Poppins', marginTop: 2 }}>
            {suppliers.length > 0 ? `${suppliers.length} active suppliers` : 'UK energy suppliers'}
          </Text>
        </View>
        <TopTabs active="suppliers" isDark={isDark} />
      </View>

      {isLoadingSuppliers ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={B.blue} />
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}>

          {/* Info banner */}
          <View style={{
            backgroundColor: '#2272A610', borderRadius: 12, padding: 12,
            borderWidth: 1, borderColor: '#2272A625', marginBottom: 16,
            flexDirection: 'row', alignItems: 'flex-start', gap: 10,
          }}>
            <Text style={{ fontSize: 18 }}>ℹ️</Text>
            <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins',
              flex: 1, lineHeight: 18 }}>
              Octopus Energy rates are live from their API. All other suppliers use
              Ofgem price cap estimates. Tap a supplier to browse their tariffs.
            </Text>
          </View>

          {sorted.map((s) => (
            <Pressable
              key={s.name}
              onPress={() => router.push({
                pathname: '/(app)/tariffs/browse',
              } as any)}>
              <View style={{
                backgroundColor: cardBg, borderRadius: 14, padding: 16,
                marginBottom: 10, borderWidth: 1, borderColor: borderC,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
                  {/* Emoji icon */}
                  <View style={{
                    width: 48, height: 48, borderRadius: 12,
                    backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
                    alignItems: 'center', justifyContent: 'center',
                    borderWidth: 1, borderColor: borderC,
                  }}>
                    <Text style={{ fontSize: 24 }}>
                      {SUPPLIER_EMOJIS[s.name] ?? '⚡'}
                    </Text>
                  </View>

                  {/* Info */}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'space-between', marginBottom: 3 }}>
                      <Text style={{ color: textFg, fontSize: 15, fontWeight: '600',
                        fontFamily: 'Poppins-SemiBold' }}>{s.name}</Text>
                      {/* Live/Cap badge */}
                      {s.name === 'Octopus Energy' ? (
                        <View style={{ backgroundColor: '#2DD4A015', borderRadius: 6,
                          paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: '#2DD4A035' }}>
                          <Text style={{ color: '#2DD4A0', fontSize: 10, fontWeight: '700' }}>● LIVE API</Text>
                        </View>
                      ) : (
                        <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB',
                          borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Ofgem cap</Text>
                        </View>
                      )}
                    </View>

                    {/* Rating */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <StarRating rating={s.rating} />
                      {s.rating && (
                        <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins' }}>
                          {s.rating.toFixed(1)}/5
                        </Text>
                      )}
                      {s.hasGreen && (
                        <Text style={{ color: '#22A660', fontSize: 11, fontFamily: 'Poppins' }}>
                          🌿 Green tariffs
                        </Text>
                      )}
                    </View>

                    {/* Stats row */}
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <View style={{
                        flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
                        borderRadius: 8, padding: 8, alignItems: 'center',
                      }}>
                        <Text style={{ color: textFg, fontSize: 16, fontWeight: '700',
                          fontFamily: 'Poppins-Bold' }}>{s.tariffCount}</Text>
                        <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Tariffs</Text>
                      </View>

                      {s.minElecRate && (
                        <View style={{
                          flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
                          borderRadius: 8, padding: 8, alignItems: 'center',
                        }}>
                          <Text style={{ color: B.blueBrt, fontSize: 16, fontWeight: '700',
                            fontFamily: 'Poppins-Bold' }}>{s.minElecRate}p</Text>
                          <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Min elec/kWh</Text>
                        </View>
                      )}

                      {s.minGasRate && (
                        <View style={{
                          flex: 1, backgroundColor: isDark ? '#0D2C40' : '#F0F6FB',
                          borderRadius: 8, padding: 8, alignItems: 'center',
                        }}>
                          <Text style={{ color: B.blueBrt, fontSize: 16, fontWeight: '700',
                            fontFamily: 'Poppins-Bold' }}>{s.minGasRate}p</Text>
                          <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins' }}>Min gas/kWh</Text>
                        </View>
                      )}
                    </View>

                    {/* Fuel + tariff type tags */}
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                      {s.fuelTypes?.map((f) => (
                        <View key={f} style={{ backgroundColor: isDark ? '#1E3A52' : '#EDF5FB',
                          borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ color: B.blue, fontSize: 10, fontFamily: 'Poppins',
                            textTransform: 'capitalize' }}>{f}</Text>
                        </View>
                      ))}
                      {s.tariffTypes?.map((t) => (
                        <View key={t} style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB',
                          borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins',
                            textTransform: 'capitalize' }}>{t}</Text>
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
