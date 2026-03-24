import { SetupHeader } from '@/components/shared/setup-header';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
  Easing,
  useAnimatedProps,
  interpolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Line } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width: W } = Dimensions.get('window');

type ContactPref = 'email' | 'phone' | 'whatsapp';

const CONTACT_OPTIONS: { id: ContactPref; label: string; icon: string }[] = [
  { id: 'email',    label: 'Email',    icon: '📧' },
  { id: 'phone',    label: 'Phone',    icon: '📞' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({
  label,
  desc,
  value,
  onChange,
}: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      // gap-3.5 = 14px, p-4 = 16px  (Tailwind defaults)
      className={[
        'flex-row items-center gap-3.5 p-4 rounded-xl border',
        value
          ? 'border-primary bg-primary/7 dark:bg-brand-selected'
          : 'border-border bg-card',
      ].join(' ')}
    >
      <View className="flex-1">
        {/* text-sm = 14px  (config › fontSize.sm) */}
        <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
          {label}
        </Text>
        {/* text-xs = 12px  (config › fontSize.xs) */}
        <Text className="text-xs mt-0.5 font-sans text-[#4A6A82] dark:text-brand-fg-muted">
          {desc}
        </Text>
      </View>

      {/* Toggle pill — w-11 = 44px, h-6.5 = 26px … h-6.5 not in scale,
          use style for exact pill dimensions to preserve visual fidelity  */}
      <View
        className={[
          'justify-center px-[3px] rounded-full',
          value ? 'bg-primary' : 'bg-border dark:bg-[#1E3A52]',
        ].join(' ')}
        style={{ width: 44, height: 26 }}
      >
        {/* Thumb — w-5 h-5 = 20px  (Tailwind default) */}
        <View
          className="w-5 h-5 rounded-full bg-white"
          style={{ alignSelf: value ? 'flex-end' : 'flex-start' }}
        />
      </View>
    </Pressable>
  );
}

// ─── Success Animation Component ──────────────────────────────────────────────

function SuccessAnimation() {
  const progress = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 1800, easing: Easing.out(Easing.exp) });
    textOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    textTranslateY.value = withDelay(800, withSpring(0, { damping: 14 }));
  }, []);

  const circleProps = useAnimatedProps(() => {
    const length = 2 * Math.PI * 44; // r=44
    return {
      strokeDashoffset: length - length * Math.min(progress.value * 2, 1), // animate 0 to 0.5 of total time
    };
  });

  const checkProps = useAnimatedProps(() => {
    const length = 52; // approx length of checkmark
    const p = Math.max(0, (progress.value - 0.4) * 2.5); // animate from 0.4 to 0.8
    return {
      strokeDashoffset: length - length * Math.min(p, 1),
    };
  });

  const bgStyle = useAnimatedStyle(() => {
    const rawScale = interpolate(progress.value, [0, 0.3], [0, 1]);
    const rawOpacity = interpolate(progress.value, [0, 0.2], [0, 1]);
    return {
      transform: [{ scale: Math.min(Math.max(rawScale, 0), 1) }],
      opacity: Math.min(Math.max(rawOpacity, 0), 1),
    };
  });

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  // Burst particles
  const burstProgress = useSharedValue(0);
  React.useEffect(() => {
    burstProgress.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.ease) }));
  }, []);

  return (
    <View className="flex-1 bg-background items-center justify-center p-8">
      <View className="items-center justify-center mb-6" style={{ width: 140, height: 140 }}>
        {/* Burst Lines */}
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i * Math.PI * 2) / 8;
          const lineStyle = useAnimatedStyle(() => {
            const distance = interpolate(burstProgress.value, [0, 1], [40, 75]);
            const opacity = interpolate(burstProgress.value, [0, 0.2, 1], [0, 1, 0]);
            return {
              position: 'absolute',
              opacity,
              transform: [
                { translateX: Math.cos(angle) * distance },
                { translateY: Math.sin(angle) * distance },
                { rotate: `${(angle * 180) / Math.PI}deg` },
              ],
            };
          });
          return (
            <Animated.View key={i} style={lineStyle}>
              <View style={{ width: 12, height: 4, borderRadius: 2, backgroundColor: '#3D9DD4' }} />
            </Animated.View>
          );
        })}

        {/* Background tint circle */}
        <Animated.View 
          style={[bgStyle, { position: 'absolute', width: 88, height: 88, borderRadius: 44, backgroundColor: 'rgba(34, 114, 166, 0.1)' }]} 
        />

        <Svg width="92" height="92" viewBox="0 0 92 92">
          {/* Animated Circle */}
          <AnimatedCircle
            cx="46"
            cy="46"
            r="44"
            fill="none"
            stroke="#2272A6"
            strokeWidth="4"
            strokeDasharray={2 * Math.PI * 44}
            animatedProps={circleProps}
            strokeLinecap="round"
            transform="rotate(-90 46 46)"
          />
          {/* Animated Checkmark */}
          <AnimatedPath
            d="M28 48 l12 12 l24 -24"
            fill="none"
            stroke="#2272A6"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="52"
            animatedProps={checkProps}
          />
        </Svg>
      </View>

      <Animated.View style={textStyle} className="items-center">
        <Text className="text-2xl font-bold text-brand dark:text-brand-fg text-center mb-2.5" style={{ fontFamily: 'Poppins-Bold' }}>
          Profile Complete!
        </Text>
        <Text className="text-sm leading-relaxed text-center text-[#4A6A82] dark:text-brand-fg-muted font-sans">
          Taking you to your dashboard…
        </Text>
      </Animated.View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Step5Screen() {
  const { profile, saveStep5, isLoading } = useProfileStore();

  const [preferGreen, setPreferGreen] = React.useState(false);
  const [preferFixed, setPreferFixed] = React.useState(true);
  const [contactPref, setContactPref] = React.useState<ContactPref>('email');
  const [isComplete,  setIsComplete]  = React.useState(false);
  const [error,       setError]       = React.useState('');

  React.useEffect(() => {
    if (profile) {
      setPreferGreen(profile.preferGreenEnergy ?? false);
      setPreferFixed(profile.preferFixedTariff ?? true);
      setContactPref(profile.contactPreference || 'email');
    }
  }, [profile]);

  // Stagger animations
  const c1  = useSharedValue(0);
  const c2  = useSharedValue(0);
  const c3  = useSharedValue(0);
  const btn = useSharedValue(0);

  const successScale   = useSharedValue(0);
  const successOpacity = useSharedValue(0);

  React.useEffect(() => {
    c1.value  = withDelay(80,  withSpring(1, { damping: 16 }));
    c2.value  = withDelay(180, withSpring(1, { damping: 16 }));
    c3.value  = withDelay(280, withSpring(1, { damping: 16 }));
    btn.value = withDelay(380, withSpring(1, { damping: 16 }));
  }, []);

  React.useEffect(() => {
    if (isComplete) {
      successOpacity.value = withTiming(1, { duration: 300 });
      successScale.value   = withSpring(1, { damping: 12, stiffness: 80 });
      const t = setTimeout(() => router.replace('/(app)'), 2500);
      return () => clearTimeout(t);
    }
  }, [isComplete]);

  const s1 = useAnimatedStyle(() => ({ opacity: c1.value,  transform: [{ translateY: (1 - c1.value)  * 16 }] }));
  const s2 = useAnimatedStyle(() => ({ opacity: c2.value,  transform: [{ translateY: (1 - c2.value)  * 16 }] }));
  const s3 = useAnimatedStyle(() => ({ opacity: c3.value,  transform: [{ translateY: (1 - c3.value)  * 16 }] }));
  const sb = useAnimatedStyle(() => ({ opacity: btn.value, transform: [{ translateY: (1 - btn.value) * 12 }] }));
  const ss = useAnimatedStyle(() => ({ opacity: successOpacity.value, transform: [{ scale: successScale.value }] }));

  const handleComplete = async () => {
    setError('');
    try {
      await saveStep5({
        preferGreenEnergy: preferGreen,
        preferFixedTariff: preferFixed,
        contactPreference: contactPref,
      });
      setIsComplete(true);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
    }
  };

  // ── Success screen ────────────────────────────────────────────────────────

  if (isComplete) {
    return <SuccessAnimation />;
  }

  // ── Main screen ───────────────────────────────────────────────────────────

  return (
    <View className="flex-1 bg-background">

      <SetupHeader
        currentStep={5}
        totalSteps={5}
        title="Almost there!"
        subtitle="Set your preferences to personalise your experience."
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Tariff preferences card ──────────────────────────────────── */}
        <Animated.View style={s1}>
          <View className="bg-card rounded-2xl p-5 border border-border gap-2.5">
            {/* text-sm = 13px  (config › fontSize.13) */}
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-1">
              Tariff Preferences
            </Text>
            <ToggleRow
              label="Prefer green energy"
              desc="Prioritise renewable energy tariffs"
              value={preferGreen}
              onChange={setPreferGreen}
            />
            <ToggleRow
              label="Prefer fixed tariffs"
              desc="Price certainty over variable rates"
              value={preferFixed}
              onChange={setPreferFixed}
            />
          </View>
        </Animated.View>

        {/* ── Contact preference card ──────────────────────────────────── */}
        <Animated.View style={s2}>
          <View className="bg-card rounded-2xl p-5 border border-border">
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-3">
              Preferred contact method
            </Text>

            <View className="flex-row gap-2.5">
              {CONTACT_OPTIONS.map((opt) => {
                const isSelected = contactPref === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setContactPref(opt.id)}
                    className="flex-1"
                  >
                    {/* p-3 = 12px, gap-1.5 = 6px  (Tailwind defaults)
                        bg-primary/7  (config › opacity.7)
                        dark:bg-brand-selected = #1A3A54  (config › brand.selected) */}
                    <View
                      className={[
                        'p-3 rounded-xl items-center gap-1.5 border',
                        isSelected
                          ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
                          : 'border-border bg-card',
                      ].join(' ')}
                    >
                      <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
                      {/* text-xs = 12px  (config › fontSize.xs) */}
                      <Text
                        className={[
                          'text-xs font-sans',
                          isSelected
                            ? 'text-primary'
                            : 'text-[#4A6A82] dark:text-primary-foreground',
                        ].join(' ')}
                      >
                        {opt.label}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Animated.View>

        {/* ── Summary card ─────────────────────────────────────────────── */}
        <Animated.View style={s3}>
          {/* bg-primary/13 = 13% tint  (config › opacity.13)
              border-primary/20 = 20% opacity border  (Tailwind default scale) */}
          <View className="bg-primary/13 dark:bg-brand-selected/40 rounded-2xl p-4 border border-primary/20">

            <View className="flex-row items-center gap-2 mb-2">
              <Svg width="16" height="16" viewBox="0 0 24 24">
                <Path
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  fill="none"
                  stroke="#2272A6"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text className="text-sm font-semibold text-primary">
                You're all set
              </Text>
            </View>

            {/* text-sm, leading-5 = 20px  (Tailwind default › 5 × 4) */}
            <Text className="text-sm leading-5 font-sans text-[#4A6A82] dark:text-primary-foreground">
              Profile complete. You can now compare tariffs, generate quotes, and manage your clients.
            </Text>

          </View>
        </Animated.View>

      </ScrollView>

      {/* ── Fixed bottom bar ─────────────────────────────────────────────── */}
      <Animated.View
        style={sb}
        className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border"
      >
        {/* Error banner
            bg-destructive/8 = 8% opacity  (config › opacity.8)
            rounded-banner   = 10px        (config › borderRadius.banner) */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            {/* text-sm = 13px  (config › fontSize.13) */}
            <Text className="text-destructive text-sm font-sans">
              {error}
            </Text>
          </View>
        ) : null}

        {/* CTA button
            h-12         = 48px  (Tailwind default › 12 × 4px)
            rounded-card = 14px  (config › borderRadius.card)
            style color  = white forced — custom Text component fix       */}
        <Pressable
          onPress={handleComplete}
          disabled={isLoading}
          className={[
            'bg-primary h-12 rounded-card items-center justify-center',
            isLoading ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          <Text style={{ color: '#ffffff' }} className="text-base font-bold">
            {isLoading ? 'Completing setup...' : 'Complete Setup'}
          </Text>
        </Pressable>

      </Animated.View>
    </View>
  );
}