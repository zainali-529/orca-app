import { useOnboardingStore } from '@/lib/store/onboarding.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Dimensions, Pressable, StatusBar, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Polygon,
  Stop,
} from 'react-native-svg';

const { width: W, height: H } = Dimensions.get('window');

// ── Brand palette — FIXED, never flips (illustration bg area) ──
const B = {
  navy:     '#0D2C40',
  navyDark: '#091F2E',
  navyMid:  '#132030',
  blue:     '#2272A6',
  blueBrt:  '#3D9DD4',
  blueDim:  '#1A5A88',
  fg:       '#F0F8FF',
  fgMuted:  '#7AAEC8',
  border:   '#1E3A52',
  white:    '#FFFFFF',
};

// ── Theme tokens — bottom card adapts to light/dark mode ──────
const THEME = {
  dark: {
    cardBg:      '#091F2E',   // deep navy card
    cardBorder:  '#1E3A52',
    title:       '#F0F8FF',
    subtitle:    '#7AAEC8',
    tagBg:       '#2272A622',
    tagBorder:   '#2272A644',
    tagText:     '#3D9DD4',
    rowBg:       '#132030',
    rowBorder:   '#1E3A52',
    rowHighBg:   '#1A5A88',
    rowHighBdr:  '#2272A6',
    statBg:      '#132030',
    statBorder:  '#1E3A52',
    featureBg:   '#132030',
    featureBdr:  '#1E3A52',
    featureText: '#F0F8FF',
    dotInactive: '#7AAEC8',
    skipText:    '#7AAEC8',
    signInText:  '#7AAEC8',
  },
  light: {
    cardBg:      '#FFFFFF',
    cardBorder:  '#D5DEE8',
    title:       '#0D2C40',   // brand navy — strong contrast on white
    subtitle:    '#4A6A82',
    tagBg:       '#2272A615',
    tagBorder:   '#2272A630',
    tagText:     '#1A5A88',
    rowBg:       '#F0F6FB',
    rowBorder:   '#C8DCE9',
    rowHighBg:   '#2272A615',
    rowHighBdr:  '#2272A6',
    statBg:      '#F0F6FB',
    statBorder:  '#C8DCE9',
    featureBg:   '#F0F6FB',
    featureBdr:  '#C8DCE9',
    featureText: '#0D2C40',
    dotInactive: '#A8C4D4',
    skipText:    '#4A6A82',
    signInText:  '#4A6A82',
  },
};

// ─────────────────────────────────────────────────────────────
// ILLUSTRATIONS
// All illustrations receive the isDark prop so they can
// adapt their card elements (while SVG brand elements stay fixed)
// ─────────────────────────────────────────────────────────────

function Illustration1({ isDark }: { isDark: boolean }) {
  const T = isDark ? THEME.dark : THEME.light;
  const scale   = useSharedValue(0.88);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    scale.value   = withSpring(1, { damping: 18, stiffness: 100 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, style]}>
      <Svg width="200" height="200" viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={B.blueBrt} stopOpacity="1" />
            <Stop offset="100%" stopColor={B.blue} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Circle cx="100" cy="100" r="88" fill="none" stroke={B.blue} strokeWidth="1" opacity="0.3" />
        <Circle cx="100" cy="100" r="64" fill="none" stroke={B.blue} strokeWidth="0.8" opacity="0.2" />
        <Circle cx="100" cy="100" r="46" fill={B.navyMid} />
        <Polygon points="108,62 88,104 102,104 92,138 116,90 102,90" fill="url(#grad1)" />
        <Circle cx="44"  cy="100" r="3" fill={B.blue} opacity="0.5" />
        <Circle cx="156" cy="100" r="3" fill={B.blue} opacity="0.5" />
        <Circle cx="100" cy="40"  r="3" fill={B.blue} opacity="0.4" />
        <Circle cx="100" cy="162" r="3" fill={B.blue} opacity="0.4" />
        <Line x1="44"  y1="100" x2="54"  y2="100" stroke={B.blue} strokeWidth="1" opacity="0.4" />
        <Line x1="146" y1="100" x2="156" y2="100" stroke={B.blue} strokeWidth="1" opacity="0.4" />
        <Line x1="100" y1="40"  x2="100" y2="50"  stroke={B.blue} strokeWidth="1" opacity="0.35" />
        <Line x1="100" y1="150" x2="100" y2="162" stroke={B.blue} strokeWidth="1" opacity="0.35" />
      </Svg>
    </Animated.View>
  );
}

function Illustration2({ isDark }: { isDark: boolean }) {
  const T = isDark ? THEME.dark : THEME.light;
  const opacity = useSharedValue(0);
  const y       = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    y.value       = withSpring(0, { damping: 18, stiffness: 100 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  const rows = [
    { name: 'British Gas',  price: '£1,240/yr', highlight: false },
    { name: 'EDF Energy',   price: '£1,190/yr', highlight: false },
    { name: 'Octopus',      price: '£1,095/yr', highlight: true  },
  ];

  return (
    <Animated.View style={[{ alignItems: 'center', gap: 10 }, style]}>
      <Text style={{ color: B.fgMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 4 }}>
        LIVE TARIFF COMPARISON
      </Text>
      {rows.map((r, i) => (
        <View key={i} style={{
          width: 240, height: 52,
          backgroundColor: r.highlight ? T.rowHighBg : T.rowBg,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: r.highlight ? T.rowHighBdr : T.rowBorder,
          flexDirection: 'row', alignItems: 'center',
          paddingHorizontal: 16, justifyContent: 'space-between',
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {r.highlight && (
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: B.blueBrt }} />
            )}
            <Text style={{
              color: r.highlight ? (isDark ? B.fg : B.navy) : T.title,
              fontSize: 14, fontWeight: r.highlight ? '700' : '500',
            }}>{r.name}</Text>
          </View>
          <Text style={{
            color: r.highlight ? B.blueBrt : T.subtitle,
            fontSize: 13, fontWeight: '700',
          }}>{r.price}</Text>
        </View>
      ))}
      <View style={{
        backgroundColor: T.tagBg,
        borderWidth: 1, borderColor: T.tagBorder,
        borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4,
      }}>
        <Text style={{ color: T.tagText, fontSize: 11, fontWeight: '700' }}>
          BEST DEAL — £145 ANNUAL SAVING
        </Text>
      </View>
    </Animated.View>
  );
}

function Illustration3({ isDark }: { isDark: boolean }) {
  const T = isDark ? THEME.dark : THEME.light;
  const opacity = useSharedValue(0);
  const y       = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    y.value       = withSpring(0, { damping: 18, stiffness: 100 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  const bars   = [55, 70, 45, 90, 68, 80];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const stats  = [
    { label: 'Clients',    value: '48'     },
    { label: 'Avg saving', value: '£138'   },
    { label: 'This month', value: '£6,620' },
  ];

  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <Text style={{ color: B.fgMuted, fontSize: 11, fontWeight: '600', letterSpacing: 1, marginBottom: 16 }}>
        SAVINGS OVERVIEW
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 100 }}>
        {bars.map((h, i) => (
          <View key={i} style={{ alignItems: 'center', gap: 5 }}>
            <View style={{
              width: 30, height: h,
              backgroundColor: i === 3 ? B.blue : i === 5 ? B.blueBrt : `${B.blue}50`,
              borderRadius: 6,
            }} />
            <Text style={{ color: B.fgMuted, fontSize: 9 }}>{months[i]}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
        {stats.map((s, i) => (
          <View key={i} style={{
            alignItems: 'center',
            backgroundColor: T.statBg,
            borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: 1, borderColor: T.statBorder,
          }}>
            <Text style={{ color: B.blueBrt, fontSize: 15, fontWeight: '700' }}>{s.value}</Text>
            <Text style={{ color: T.subtitle, fontSize: 10, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

function Illustration4({ isDark }: { isDark: boolean }) {
  const T = isDark ? THEME.dark : THEME.light;
  const opacity = useSharedValue(0);
  const y       = useSharedValue(16);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 450 });
    y.value       = withSpring(0, { damping: 18, stiffness: 100 });
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: y.value }],
  }));

  const features = [
    { icon: '⚡', label: 'Tariff comparison'     },
    { icon: '📄', label: 'PDF quotes & e-sign'   },
    { icon: '🔄', label: 'Switch tracker'         },
    { icon: '💳', label: 'Payments & commission'  },
  ];

  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <Svg width="72" height="72" viewBox="0 0 24 28" style={{ marginBottom: 20 }}>
        <Defs>
          <LinearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={B.blueBrt} stopOpacity="0.9" />
            <Stop offset="100%" stopColor={B.blue} stopOpacity="1" />
          </LinearGradient>
        </Defs>
        <Path
          d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6L12 2z"
          fill="url(#shieldGrad)"
        />
        <Path d="M8 13l3 3 5-5" fill="none" stroke={B.white} strokeWidth="1.8"
          strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', maxWidth: 280 }}>
        {features.map((f, i) => (
          <View key={i} style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: T.featureBg, borderRadius: 10,
            paddingHorizontal: 14, paddingVertical: 10,
            borderWidth: 1, borderColor: T.featureBdr,
          }}>
            <Text style={{ fontSize: 14 }}>{f.icon}</Text>
            <Text style={{ color: T.featureText, fontSize: 12, fontWeight: '500' }}>{f.label}</Text>
          </View>
        ))}
      </View>
    </Animated.View>
  );
}

// ── Dot ───────────────────────────────────────────────────────

function Dot({ active, isDark }: { active: boolean; isDark: boolean }) {
  const T = isDark ? THEME.dark : THEME.light;
  const width   = useSharedValue(active ? 22 : 7);
  const opacity = useSharedValue(active ? 1 : 0.4);

  React.useEffect(() => {
    width.value   = withSpring(active ? 22 : 7, { damping: 16 });
    opacity.value = withTiming(active ? 1 : 0.4, { duration: 250 });
  }, [active]);

  const style = useAnimatedStyle(() => ({ width: width.value, opacity: opacity.value }));

  return (
    <Animated.View style={[{
      height: 7, borderRadius: 4,
      backgroundColor: active ? B.blueBrt : T.dotInactive,
    }, style]} />
  );
}

// ── Slides ────────────────────────────────────────────────────

const SLIDES = [
  {
    tag: 'WELCOME',
    title: 'Your energy,\nour expertise',
    subtitle: 'The smarter way for UK brokers to manage clients, compare tariffs, and close deals.',
    Illustration: Illustration1,
  },
  {
    tag: 'COMPARE TARIFFS',
    title: 'Best deal,\nevery time',
    subtitle: 'Compare live tariffs from all major UK suppliers instantly. Always win for your clients.',
    Illustration: Illustration2,
  },
  {
    tag: 'TRACK SAVINGS',
    title: 'Grow your\nbusiness',
    subtitle: 'Monitor savings across your entire portfolio. Turn every switch into commission.',
    Illustration: Illustration3,
  },
  {
    tag: 'GET STARTED',
    title: 'Everything\nin one place',
    subtitle: 'Quotes, contracts, signatures, switch tracking — the complete toolkit for modern energy brokers.',
    Illustration: Illustration4,
  },
];

// ── Main screen ───────────────────────────────────────────────

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const { completeOnboarding } = useOnboardingStore();
  const { colorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';
  const T      = isDark ? THEME.dark : THEME.light;

  const contentOpacity = useSharedValue(1);
  const contentY       = useSharedValue(0);
  const isLast = currentIndex === SLIDES.length - 1;

  const animateIn = () => {
    contentOpacity.value = 0;
    contentY.value       = 14;
    contentOpacity.value = withDelay(60, withTiming(1,   { duration: 380 }));
    contentY.value       = withDelay(60, withSpring(0,   { damping: 18 }));
  };

  const goNext = () => {
    if (isLast) { handleDone(); return; }
    contentOpacity.value = withTiming(0, { duration: 180 }, (done) => {
      if (done) runOnJS(setCurrentIndex)(currentIndex + 1);
    });
  };

  React.useEffect(() => { animateIn(); }, [currentIndex]);

  const handleDone = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  const { Illustration } = SLIDES[currentIndex];

  return (
    <View style={{ flex: 1, backgroundColor: B.navy }}>
      {/* StatusBar: always light on brand navy top, auto on card area */}
      <StatusBar barStyle="light-content" backgroundColor={B.navy} />

      {/* Skip */}
      {!isLast && (
        <Pressable
          onPress={handleDone}
          style={{ position: 'absolute', top: 54, right: 24, zIndex: 10, padding: 8 }}>
          <Text style={{ color: B.fgMuted, fontSize: 14, fontWeight: '500' }}>Skip</Text>
        </Pressable>
      )}

      {/* ── Top: brand navy background + illustration ── */}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 50 }}>
        <Illustration key={currentIndex} isDark={true} />
        {/* Illustrations always render on brand navy, so always dark */}
      </View>

      {/* ── Bottom: theme-aware card ── */}
      <Animated.View style={[{
        backgroundColor: T.cardBg,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 44,
        minHeight: H * 0.42,
        borderTopWidth: 1,
        borderColor: T.cardBorder,
      }, contentStyle]}>

        {/* Tag */}
        <View style={{
          alignSelf: 'flex-start',
          backgroundColor: T.tagBg,
          borderWidth: 1, borderColor: T.tagBorder,
          borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 14,
        }}>
          <Text style={{ color: T.tagText, fontSize: 10, fontWeight: '700', letterSpacing: 1.2 }}>
            {SLIDES[currentIndex].tag}
          </Text>
        </View>

        {/* Title */}
        <Text style={{ color: T.title, fontSize: 28, fontWeight: '700', lineHeight: 36, marginBottom: 12 }}>
          {SLIDES[currentIndex].title}
        </Text>

        {/* Subtitle */}
        <Text style={{ color: T.subtitle, fontSize: 14, lineHeight: 22, marginBottom: 30 }}>
          {SLIDES[currentIndex].subtitle}
        </Text>

        {/* Dots + CTA row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            {SLIDES.map((_, i) => (
              <Dot key={i} active={i === currentIndex} isDark={isDark} />
            ))}
          </View>

          {/* Next / Get Started button
              - Uses a stable View inside Pressable for reliable row layout
              - backgroundColor uses B.blue which is hardcoded — never affected by theme
              - In light mode the card is white, so the blue button is clearly visible
              - The icon sits beside the text because the inner View is flexDirection row
          */}
          <Pressable onPress={goNext}>
            {({ pressed }) => (
              <View style={{
                backgroundColor: pressed ? B.blueDim : B.blue,
                paddingHorizontal: isLast ? 26 : 20,
                paddingVertical: 13,
                borderRadius: 50,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                // Subtle shadow so button pops on both white and dark card
                shadowColor: B.blue,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0 : 0.25,
                shadowRadius: 6,
                elevation: isDark ? 0 : 3,
              }}>
                <Text style={{
                  color: B.white,
                  fontSize: 14,
                  fontWeight: '700',
                  fontFamily: 'Poppins-Bold',
                }}>
                  {isLast ? 'Get Started' : 'Next'}
                </Text>
                {!isLast && (
                  <Svg width="14" height="14" viewBox="0 0 24 24">
                    <Path d="M9 18l6-6-6-6" fill="none" stroke={B.white}
                      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            )}
          </Pressable>
        </View>

        {/* Sign in — last slide */}
        {isLast && (
          <Pressable
            onPress={handleDone}
            style={{ alignItems: 'center', marginTop: 18 }}>
            <Text style={{ color: T.signInText, fontSize: 13 }}>
              Already have an account?{' '}
              <Text style={{ color: B.blueBrt, fontWeight: '600' }}>Sign in</Text>
            </Text>
          </Pressable>
        )}

      </Animated.View>
    </View>
  );
}