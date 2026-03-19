import { Text } from '@/components/ui/text';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const FEATURES = [
  'Professional PDF quotes',
  'Client e-signature',
  'Auto-populated tariff data',
  'Email delivery',
  'Quote history',
];

export default function QuotesScreen() {
  return (
    <View className="flex-1 bg-background">

      {/* ── Header — always brand navy ──────────────────────────── */}
      <View className="bg-brand pt-14 pb-6 px-5">
        <Text className="text-xl font-bold text-brand-fg">Quotes</Text>
        <Text className="text-sm font-sans mt-1 text-brand-fg-muted">
          Generate and manage energy quotes
        </Text>
      </View>

      {/* ── Empty state ─────────────────────────────────────────── */}
      <View className="flex-1 items-center justify-center p-10 gap-4">

        {/* Icon box */}
        <View className="w-20 h-20 rounded-2xl bg-primary/8 items-center justify-center border border-primary/20">
          <Svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <Path
              d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
            <Path
              d="M14 2v6h6M12 18v-6M9 15h6"
              stroke="#2272A6" strokeWidth="2" strokeLinecap="round"
            />
          </Svg>
        </View>

        <Text className="text-lg font-bold text-brand dark:text-brand-fg text-center">
          Quote Generator
        </Text>

        <Text className="text-sm font-sans text-center leading-relaxed text-[#4A6A82] dark:text-brand-fg-muted">
          PDF quote generation with e-signature support is coming in Week 2.
          Compare tariffs first to get started.
        </Text>

        {/* Feature list card */}
        <View className="bg-primary/8 rounded-xl p-3 border border-primary/15 w-full">
          {FEATURES.map((f) => (
            <View key={f} className="flex-row items-center gap-2 py-1">
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