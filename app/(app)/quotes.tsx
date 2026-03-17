import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export default function QuotesScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ backgroundColor: '#0D2C40', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#F0F8FF', fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
          Quotes
        </Text>
        <Text style={{ color: '#7AAEC8', fontSize: 13, fontFamily: 'Poppins', marginTop: 4 }}>
          Generate and manage energy quotes
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 20,
          backgroundColor: '#2272A615', alignItems: 'center', justifyContent: 'center',
          borderWidth: 1, borderColor: '#2272A630',
        }}>
          <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M14 2v6h6M12 18v-6M9 15h6"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" />
          </Svg>
        </View>
        <Text style={{ color: textFg, fontSize: 18, fontWeight: '700',
          fontFamily: 'Poppins-Bold', textAlign: 'center' }}>Quote Generator</Text>
        <Text style={{ color: mutedFg, fontSize: 14, fontFamily: 'Poppins',
          textAlign: 'center', lineHeight: 22 }}>
          PDF quote generation with e-signature support is coming in Week 2.
          Compare tariffs first to get started.
        </Text>
        <View style={{
          backgroundColor: '#2272A615', borderRadius: 12, padding: 12,
          borderWidth: 1, borderColor: '#2272A625', width: '100%',
        }}>
          {['Professional PDF quotes', 'Client e-signature', 'Auto-populated tariff data',
            'Email delivery', 'Quote history'].map((f) => (
            <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#2272A6' }} />
              <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins' }}>{f}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
