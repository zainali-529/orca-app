import { Text } from '@/components/ui/text';
import { useTariffStore } from '@/lib/store/tariff.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, View } from 'react-native';
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
    <View style={{ flexDirection: 'row', backgroundColor: isDark ? '#0A1929' : '#0D2C40', paddingBottom: 0 }}>
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

function Chip({ label, active, onPress, isDark }: { label: string; active: boolean; onPress: () => void; isDark: boolean }) {
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

const SUPPLIERS_FILTER = ['All', 'Octopus Energy', 'British Gas', 'EDF Energy', 'E.ON Next',
  'Scottish Power', 'Ovo Energy', 'Shell Energy', 'So Energy'];
const FUEL_OPTS   = [{ id: '', label: 'All' }, { id: 'dual', label: 'Dual' },
  { id: 'electricity', label: 'Electricity' }, { id: 'gas', label: 'Gas' }];
const TYPE_OPTS   = [{ id: '', label: 'All' }, { id: 'fixed', label: 'Fixed' },
  { id: 'variable', label: 'Variable' }, { id: 'flexible', label: 'Flexible' }];
const SORT_OPTS   = [{ id: 'annualCost', label: 'Cheapest' }, { id: 'rating', label: 'Rating' },
  { id: 'cashback', label: 'Cashback' }];

export default function BrowseScreen() {
  const { tariffs, pagination, isLoadingList, loadTariffs } = useTariffStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fuelType,  setFuelType]  = React.useState('');
  const [tariffType,setTariffType]= React.useState('');
  const [supplier,  setSupplier]  = React.useState('All');
  const [sortBy,    setSortBy]    = React.useState('annualCost');
  const [greenOnly, setGreenOnly] = React.useState(false);
  const [page,      setPage]      = React.useState(1);

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  const fetchTariffs = (p = 1) => {
    loadTariffs({
      fuelType:    fuelType    || undefined,
      tariffType:  tariffType  || undefined,
      supplier:    supplier === 'All' ? undefined : supplier,
      isGreen:     greenOnly ? 'true' : undefined,
      sortBy,
      order: 'asc',
      page: p,
      limit: 15,
    });
    setPage(p);
  };

  React.useEffect(() => { fetchTariffs(1); }, [fuelType, tariffType, supplier, sortBy, greenOnly]);

  const renderItem = ({ item: t, index: i }: any) => (
    <Pressable onPress={() => router.push(`/(app)/tariffs/${t._id}` as any)}>
      <View style={{
        backgroundColor: cardBg, borderRadius: 14, padding: 14,
        marginBottom: 8, borderWidth: 1, borderColor: borderC,
        flexDirection: 'row', alignItems: 'center', gap: 12,
      }}>
        {/* Rank */}
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: (page - 1) * 15 + i === 0 ? B.blue : (isDark ? '#1E3A52' : '#E5EDF3'),
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Text style={{ color: (page - 1) * 15 + i === 0 ? '#fff' : mutedFg,
            fontSize: 11, fontWeight: '700' }}>{(page - 1) * 15 + i + 1}</Text>
        </View>

        {/* Info */}
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: textFg, fontSize: 14, fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>
              {t.supplier}
            </Text>
            {t.source === 'octopus' && (
              <View style={{ backgroundColor: '#2DD4A015', borderRadius: 5,
                paddingHorizontal: 5, paddingVertical: 2 }}>
                <Text style={{ color: '#2DD4A0', fontSize: 8, fontWeight: '700' }}>● LIVE</Text>
              </View>
            )}
            {t.isGreen && <Text style={{ fontSize: 11 }}>🌿</Text>}
          </View>
          <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins' }} numberOfLines={1}>
            {t.tariffName}
          </Text>
          <View style={{ flexDirection: 'row', gap: 6, marginTop: 2 }}>
            <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 5,
              paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins',
                textTransform: 'capitalize' }}>{t.tariffType}</Text>
            </View>
            <View style={{ backgroundColor: isDark ? '#1E3A52' : '#F0F6FB', borderRadius: 5,
              paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ color: mutedFg, fontSize: 10, fontFamily: 'Poppins',
                textTransform: 'capitalize' }}>{t.fuelType}</Text>
            </View>
          </View>
        </View>

        {/* Rates */}
        <View style={{ alignItems: 'flex-end', gap: 3 }}>
          {t.electricity?.unitRate && (
            <Text style={{ color: B.blueBrt, fontSize: 13, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
              {t.electricity.unitRate}p/kWh
            </Text>
          )}
          {t.gas?.unitRate && (
            <Text style={{ color: mutedFg, fontSize: 12, fontFamily: 'Poppins' }}>
              Gas {t.gas.unitRate}p
            </Text>
          )}
          {t.cashback > 0 && (
            <Text style={{ color: '#2DD4A0', fontSize: 11, fontFamily: 'Poppins' }}>
              £{t.cashback} back
            </Text>
          )}
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M9 18l6-6-6-6" stroke={isDark ? '#4A6A82' : '#8BA8C4'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {/* Header */}
      <View style={{ backgroundColor: B.navy, paddingTop: 56, paddingBottom: 0 }}>
        <View style={{ paddingHorizontal: 20, paddingBottom: 14 }}>
          <Text style={{ color: B.fg, fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            Tariffs
          </Text>
          <Text style={{ color: B.fgMuted, fontSize: 13, fontFamily: 'Poppins', marginTop: 2 }}>
            {pagination ? `${pagination.total} tariffs in database` : 'Browse all UK tariffs'}
          </Text>
        </View>
        <TopTabs active="browse" isDark={isDark} />
      </View>

      {/* Filters strip */}
      <View style={{
        backgroundColor: isDark ? '#0D1F2E' : '#F8FAFC',
        borderBottomWidth: 1, borderBottomColor: borderC, paddingVertical: 12,
      }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {/* Fuel */}
          {FUEL_OPTS.map(f => (
            <Chip key={f.id} label={f.label} isDark={isDark}
              active={fuelType === f.id} onPress={() => setFuelType(f.id)} />
          ))}
          <View style={{ width: 1, backgroundColor: borderC, marginHorizontal: 4 }} />
          {/* Type */}
          {TYPE_OPTS.map(t => (
            <Chip key={t.id} label={t.label} isDark={isDark}
              active={tariffType === t.id} onPress={() => setTariffType(t.id)} />
          ))}
          <View style={{ width: 1, backgroundColor: borderC, marginHorizontal: 4 }} />
          {/* Green */}
          <Chip label="🌿 Green" isDark={isDark}
            active={greenOnly} onPress={() => setGreenOnly(!greenOnly)} />
        </ScrollView>

        {/* Supplier filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 8 }}>
          {SUPPLIERS_FILTER.map(s => (
            <Chip key={s} label={s} isDark={isDark}
              active={supplier === s} onPress={() => setSupplier(s)} />
          ))}
        </ScrollView>

        {/* Sort */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginTop: 8 }}>
          <Text style={{ color: mutedFg, fontSize: 11, fontFamily: 'Poppins',
            alignSelf: 'center', marginRight: 4 }}>Sort:</Text>
          {SORT_OPTS.map(s => (
            <Chip key={s.id} label={s.label} isDark={isDark}
              active={sortBy === s.id} onPress={() => setSortBy(s.id)} />
          ))}
        </ScrollView>
      </View>

      {isLoadingList ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={B.blue} />
        </View>
      ) : (
        <FlatList
          data={tariffs}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: textFg, fontSize: 16, fontFamily: 'Poppins-SemiBold' }}>No tariffs found</Text>
              <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins', marginTop: 6 }}>Try adjusting your filters</Text>
            </View>
          }
          ListFooterComponent={
            pagination && pagination.totalPages > 1 ? (
              <View style={{ flexDirection: 'row', justifyContent: 'center',
                gap: 12, paddingVertical: 16 }}>
                {page > 1 && (
                  <Pressable onPress={() => fetchTariffs(page - 1)}
                    style={{ backgroundColor: cardBg, borderRadius: 10, paddingHorizontal: 16,
                      paddingVertical: 10, borderWidth: 1, borderColor: borderC }}>
                    <Text style={{ color: textFg, fontFamily: 'Poppins' }}>← Prev</Text>
                  </Pressable>
                )}
                <View style={{ backgroundColor: B.blue, borderRadius: 10,
                  paddingHorizontal: 16, paddingVertical: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontFamily: 'Poppins' }}>
                    {page} / {pagination.totalPages}
                  </Text>
                </View>
                {page < pagination.totalPages && (
                  <Pressable onPress={() => fetchTariffs(page + 1)}
                    style={{ backgroundColor: cardBg, borderRadius: 10, paddingHorizontal: 16,
                      paddingVertical: 10, borderWidth: 1, borderColor: borderC }}>
                    <Text style={{ color: textFg, fontFamily: 'Poppins' }}>Next →</Text>
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
