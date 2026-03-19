import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

interface SetupHeaderProps {
  currentStep: number;
  totalSteps:  number;
  title:       string;
  subtitle:    string;
  onBack?:     () => void;
}

// Brand colors — fixed, never flip (rendered on navy bg)
const B = {
  navy:    '#0D2C40',
  blue:    '#2272A6',
  blueBrt: '#3D9DD4',
  fg:      '#F0F8FF',
  fgMuted: '#7AAEC8',
};

// ─── Step dot ─────────────────────────────────────────────────────────────────

function StepDot({ index, current }: { index: number; current: number }) {
  const done   = index < current - 1;
  const active = index === current - 1;
  const scale  = useSharedValue(1);

  React.useEffect(() => {
    scale.value = active
      ? withSpring(1.15, { damping: 12 })
      : withTiming(1, { duration: 200 });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      {/* width animated (28 active / 20 inactive) — kept as style prop */}
      <View style={{
        width:           active ? 28 : 20,
        height:          20,
        borderRadius:    10,
        backgroundColor: done || active ? B.blue : `${B.blue}30`,
        borderWidth:     1,
        borderColor:     done || active ? B.blueBrt : `${B.blue}40`,
        alignItems:      'center',
        justifyContent:  'center',
      }}>
        {done ? (
          <Svg width="10" height="10" viewBox="0 0 10 10">
            <Path d="M2 5l2.5 2.5L8 2.5" fill="none" stroke={B.fg}
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        ) : (
          <Text style={{ color: active ? B.fg : B.fgMuted, fontSize: 9, fontWeight: '700' }}>
            {index + 1}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Setup header ─────────────────────────────────────────────────────────────

export function SetupHeader({ currentStep, totalSteps, title, subtitle, onBack }: SetupHeaderProps) {
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withSpring((currentStep / totalSteps) * 100, { damping: 18 });
  }, [currentStep]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(profile-setup)/step-1');
    }
  };

  return (
    // bg-brand = #0D2C40 — fixed navy, never flips
    // pt-14 = 56px, pb-8 = 32px, px-6 = 24px  (Tailwind defaults)
    <View className="bg-brand px-6 pt-14 pb-8">

      {/* Back button */}
      <Pressable
        onPress={handleBack}
        hitSlop={12}
        className="flex-row items-center gap-1.5 mb-5"
      >
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" fill="none" stroke={B.fgMuted}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={{ color: B.fgMuted, fontSize: 14, fontFamily: 'Poppins' }}>Back</Text>
      </Pressable>

      {/* Step dots row */}
      <View className="flex-row items-center gap-1.5 mb-5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            <StepDot index={i} current={currentStep} />
            {i < totalSteps - 1 && (
              // Connector line between dots
              <View style={{ flex: 1, height: 1, backgroundColor: `${B.blue}30` }} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Progress bar track */}
      <View
        className="mb-5 rounded-sm overflow-hidden"
        style={{ height: 3, backgroundColor: `${B.blue}25` }}
      >
        {/* Animated fill — width animated so style prop required */}
        <Animated.View
          style={[barStyle, { height: '100%', backgroundColor: B.blue, borderRadius: 2 }]}
        />
      </View>

      {/* Step badge */}
      <View
        className="self-start rounded-full px-2.5 py-1 mb-2.5"
        style={{
          backgroundColor: `${B.blue}22`,
          borderWidth:      1,
          borderColor:      `${B.blue}44`,
        }}
      >
        <Text style={{
          color: B.blueBrt, fontSize: 10, fontWeight: '700',
          letterSpacing: 1, fontFamily: 'Poppins-Bold',
        }}>
          STEP {currentStep} OF {totalSteps}
        </Text>
      </View>

      {/* Title — fontSize: 24 = text-2xl, lineHeight: 32 kept as style */}
      <Text style={{
        color: B.fg, fontSize: 24, fontWeight: '700',
        lineHeight: 32, fontFamily: 'Poppins-Bold', marginBottom: 4,
      }}>
        {title}
      </Text>

      {/* Subtitle — fontSize: 14 = text-sm, lineHeight: 20 kept as style */}
      <Text style={{ color: B.fgMuted, fontSize: 14, lineHeight: 20, fontFamily: 'Poppins' }}>
        {subtitle}
      </Text>
    </View>
  );
}