import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const FEATURES = [
  'Client profiles & contacts',
  'Energy account details',
  'Switch progress tracker',
  'Contract renewals',
  'Commission tracking',
];

export default function ClientsScreen() {
  return (
    <View className="flex-1 bg-background">

      {/* ── Header — always brand navy ──────────────────────────── */}
      <View className="bg-brand pt-14 pb-6 px-5">
        <Text className="text-xl font-bold text-brand-fg">Clients</Text>
        <Text className="text-sm font-sans mt-1 text-brand-fg-muted">
          Manage your energy brokerage clients
        </Text>
      </View>

      {/* ── Empty state ─────────────────────────────────────────── */}
      <View className="flex-1 items-center justify-center p-10 gap-4">

        {/* Icon box — w-20 h-20 = 80px  (Tailwind default) */}
        <View className="w-20 h-20 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20">
          <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <Path
              d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <Circle cx="9" cy="7" r="4" stroke="#2272A6" strokeWidth="2" />
            <Path
              d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </Svg>
        </View>

        <Text className="text-lg font-bold text-brand dark:text-brand-fg text-center">
          Client CRM
        </Text>

        <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
          Full client management with switch tracking is coming in Week 3.
        </Text>

        {/* Feature list card */}
        <View className="bg-primary/8 rounded-xl p-3 border border-primary/15 w-full">
          {FEATURES.map((f) => (
            <View key={f} className="flex-row items-center gap-2 py-1">
              {/* Dot — w-1.5 h-1.5 = 6px  (Tailwind default) */}
              <View className="w-1.5 h-1.5 rounded-full bg-primary" />
              <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                {f}
              </Text>
            </View>
          ))}
        </View>

      </View>
    </View>
  );
}