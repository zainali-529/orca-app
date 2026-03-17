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

const B = {
  navy:    '#0D2C40',
  blue:    '#2272A6',
  blueBrt: '#3D9DD4',
  fg:      '#F0F8FF',
  fgMuted: '#7AAEC8',
  border:  '#1E3A52',
};

function StepDot({ index, current }: { index: number; current: number }) {
  const done   = index < current - 1;
  const active = index === current - 1;
  const scale  = useSharedValue(1);

  React.useEffect(() => {
    scale.value = active
      ? withSpring(1.15, { damping: 12 })
      : withTiming(1, { duration: 200 });
  }, [active]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <View style={{
        width: active ? 28 : 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: done || active ? B.blue : `${B.blue}30`,
        borderWidth: 1,
        borderColor: done || active ? B.blueBrt : `${B.blue}40`,
        alignItems: 'center',
        justifyContent: 'center',
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

export function SetupHeader({ currentStep, totalSteps, title, subtitle, onBack }: SetupHeaderProps) {
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withSpring((currentStep / totalSteps) * 100, { damping: 18 });
  }, [currentStep]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  // ── Safe back navigation — never crashes ──────────────────
  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // Fallback: go back only if possible, otherwise go to step-1
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(profile-setup)/step-1');
    }
  };

  return (
    <View style={{
      backgroundColor: B.navy,
      paddingHorizontal: 24,
      paddingTop: 56,
      paddingBottom: 32,
    }}>

      {/* Back button */}
      <Pressable
        onPress={handleBack}
        hitSlop={12}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Path d="M15 18l-6-6 6-6" fill="none" stroke={B.fgMuted}
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <Text style={{ color: B.fgMuted, fontSize: 14, fontFamily: 'Poppins' }}>Back</Text>
      </Pressable>

      {/* Step dots */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <React.Fragment key={i}>
            <StepDot index={i} current={currentStep} />
            {i < totalSteps - 1 && (
              <View style={{ flex: 1, height: 1, backgroundColor: `${B.blue}30` }} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Progress bar */}
      <View style={{
        height: 3,
        backgroundColor: `${B.blue}25`,
        borderRadius: 2,
        marginBottom: 20,
        overflow: 'hidden',
      }}>
        <Animated.View style={[{
          height: '100%',
          backgroundColor: B.blue,
          borderRadius: 2,
        }, barStyle]} />
      </View>

      {/* Step badge */}
      <View style={{
        alignSelf: 'flex-start',
        backgroundColor: `${B.blue}22`,
        borderWidth: 1,
        borderColor: `${B.blue}44`,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 3,
        marginBottom: 10,
      }}>
        <Text style={{
          color: B.blueBrt, fontSize: 10, fontWeight: '700',
          letterSpacing: 1, fontFamily: 'Poppins-Bold',
        }}>
          STEP {currentStep} OF {totalSteps}
        </Text>
      </View>

      <Text style={{
        color: B.fg, fontSize: 24, fontWeight: '700',
        lineHeight: 32, fontFamily: 'Poppins-Bold', marginBottom: 4,
      }}>
        {title}
      </Text>
      <Text style={{ color: B.fgMuted, fontSize: 14, lineHeight: 20, fontFamily: 'Poppins' }}>
        {subtitle}
      </Text>
    </View>
  );
}
