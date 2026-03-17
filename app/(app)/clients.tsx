import { Text } from '@/components/ui/text';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

export default function ClientsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const textFg  = isDark ? '#F0F8FF' : '#0D2C40';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <View style={{ backgroundColor: '#0D2C40', paddingTop: 56, paddingBottom: 24, paddingHorizontal: 20 }}>
        <Text style={{ color: '#F0F8FF', fontSize: 22, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
          Clients
        </Text>
        <Text style={{ color: '#7AAEC8', fontSize: 13, fontFamily: 'Poppins', marginTop: 4 }}>
          Manage your energy brokerage clients
        </Text>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 16 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 20,
          backgroundColor: '#2272A615', alignItems: 'center', justifyContent: 'center',
          borderWidth: 1, borderColor: '#2272A630',
        }}>
          <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <Circle cx="9" cy="7" r="4" stroke="#2272A6" strokeWidth="2" />
            <Path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={{ color: textFg, fontSize: 18, fontWeight: '700',
          fontFamily: 'Poppins-Bold', textAlign: 'center' }}>Client CRM</Text>
        <Text style={{ color: mutedFg, fontSize: 14, fontFamily: 'Poppins',
          textAlign: 'center', lineHeight: 22 }}>
          Full client management with switch tracking is coming in Week 3.
        </Text>
        <View style={{
          backgroundColor: '#2272A615', borderRadius: 12, padding: 12,
          borderWidth: 1, borderColor: '#2272A625', width: '100%',
        }}>
          {['Client profiles & contacts', 'Energy account details', 'Switch progress tracker',
            'Contract renewals', 'Commission tracking'].map((f) => (
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
