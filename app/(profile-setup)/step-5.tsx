import { SetupHeader } from '@/components/shared/setup-header';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type ContactPref = 'email' | 'phone' | 'whatsapp';

const CONTACT_OPTIONS: { id: ContactPref; label: string; icon: string }[] = [
  { id: 'email',    label: 'Email',    icon: '📧' },
  { id: 'phone',    label: 'Phone',    icon: '📞' },
  { id: 'whatsapp', label: 'WhatsApp', icon: '💬' },
];

function ToggleRow({
  label, desc, value, onChange, isDark,
}: {
  label: string; desc: string; value: boolean;
  onChange: (v: boolean) => void; isDark: boolean;
}) {
  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 14,
        padding: 16, borderRadius: 12,
        backgroundColor: value
          ? isDark ? '#1A3A54' : '#EDF5FB'
          : isDark ? '#132030' : '#FFFFFF',
        borderWidth: 1,
        borderColor: value ? '#2272A6' : isDark ? '#1E3A52' : '#E5EDF3',
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{
          color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 14,
          fontWeight: '600', fontFamily: 'Poppins-SemiBold',
        }}>{label}</Text>
        <Text style={{
          color: isDark ? '#7AAEC8' : '#4A6A82', fontSize: 12,
          fontFamily: 'Poppins', marginTop: 2,
        }}>{desc}</Text>
      </View>
      <View style={{
        width: 44, height: 26, borderRadius: 13,
        backgroundColor: value ? '#2272A6' : isDark ? '#1E3A52' : '#D5DEE8',
        justifyContent: 'center', paddingHorizontal: 3,
      }}>
        <View style={{
          width: 20, height: 20, borderRadius: 10,
          backgroundColor: '#FFFFFF',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }} />
      </View>
    </Pressable>
  );
}

export default function Step5Screen() {
  // ── ALL HOOKS FIRST — never conditionally ─────────────────
  const { saveStep5, isLoading } = useProfileStore();
  const { colorScheme } = useColorScheme();

  const [preferGreen, setPreferGreen] = React.useState(false);
  const [preferFixed, setPreferFixed] = React.useState(true);
  const [contactPref, setContactPref] = React.useState<ContactPref>('email');
  const [isComplete,  setIsComplete]  = React.useState(false);
  const [error,       setError]       = React.useState('');

  // Stagger animations — always run
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
      const t = setTimeout(() => router.replace('/(app)'), 1800);
      return () => clearTimeout(t);
    }
  }, [isComplete]);

  // Animated styles — always computed
  const s1  = useAnimatedStyle(() => ({ opacity: c1.value,  transform: [{ translateY: (1 - c1.value)  * 16 }] }));
  const s2  = useAnimatedStyle(() => ({ opacity: c2.value,  transform: [{ translateY: (1 - c2.value)  * 16 }] }));
  const s3  = useAnimatedStyle(() => ({ opacity: c3.value,  transform: [{ translateY: (1 - c3.value)  * 16 }] }));
  const sb  = useAnimatedStyle(() => ({ opacity: btn.value, transform: [{ translateY: (1 - btn.value) * 12 }] }));
  const ss  = useAnimatedStyle(() => ({ opacity: successOpacity.value, transform: [{ scale: successScale.value }] }));
  // ── END HOOKS ──────────────────────────────────────────────

  const isDark  = colorScheme === 'dark';
  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

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

  // ── Success screen — conditional render AFTER all hooks ───
  if (isComplete) {
    return (
      <View style={{ flex: 1, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Animated.View style={[{ alignItems: 'center' }, ss]}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: '#2272A620',
            borderWidth: 2, borderColor: '#2272A6',
            alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          }}>
            <Svg width="40" height="40" viewBox="0 0 24 24">
              <Path d="M4 12l5 5L20 7" fill="none" stroke="#2272A6"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
          <Text style={{
            color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 24,
            fontWeight: '700', fontFamily: 'Poppins-Bold',
            textAlign: 'center', marginBottom: 10,
          }}>Profile Complete!</Text>
          <Text style={{
            color: mutedFg, fontSize: 14, fontFamily: 'Poppins',
            textAlign: 'center', lineHeight: 22,
          }}>Taking you to your dashboard…</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SetupHeader
        currentStep={5}
        totalSteps={5}
        title="Almost there!"
        subtitle="Set your preferences to personalise your experience."
        onBack={() => router.back()}
      />

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* Tariff preferences */}
        <Animated.View style={s1}>
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 20,
            borderWidth: 1, borderColor: borderC, gap: 10,
          }}>
            <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 13,
              fontWeight: '600', fontFamily: 'Poppins-SemiBold', marginBottom: 4 }}>
              Tariff Preferences
            </Text>
            <ToggleRow
              label="Prefer green energy"
              desc="Prioritise renewable energy tariffs"
              value={preferGreen} onChange={setPreferGreen} isDark={isDark}
            />
            <ToggleRow
              label="Prefer fixed tariffs"
              desc="Price certainty over variable rates"
              value={preferFixed} onChange={setPreferFixed} isDark={isDark}
            />
          </View>
        </Animated.View>

        {/* Contact preference */}
        <Animated.View style={s2}>
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 20,
            borderWidth: 1, borderColor: borderC,
          }}>
            <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 13,
              fontWeight: '600', fontFamily: 'Poppins-SemiBold', marginBottom: 12 }}>
              Preferred contact method
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {CONTACT_OPTIONS.map((opt) => (
                <Pressable key={opt.id} onPress={() => setContactPref(opt.id)} style={{ flex: 1 }}>
                  <View style={{
                    padding: 12, borderRadius: 12, alignItems: 'center', gap: 6,
                    borderWidth: 1,
                    borderColor: contactPref === opt.id ? '#2272A6' : borderC,
                    backgroundColor: contactPref === opt.id
                      ? isDark ? '#1A3A54' : '#EDF5FB'
                      : isDark ? '#0D2C40' : '#F8FAFC',
                  }}>
                    <Text style={{ fontSize: 20 }}>{opt.icon}</Text>
                    <Text style={{
                      fontSize: 12,
                      color: contactPref === opt.id ? '#2272A6' : mutedFg,
                      fontFamily: 'Poppins',
                    }}>{opt.label}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Summary card */}
        <Animated.View style={s3}>
          <View style={{
            backgroundColor: isDark ? '#1A3A54' : '#EDF5FB',
            borderRadius: 16, padding: 16,
            borderWidth: 1, borderColor: '#2272A630',
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Svg width="16" height="16" viewBox="0 0 24 24">
                <Path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  fill="none" stroke="#2272A6" strokeWidth="1.8"
                  strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ color: '#2272A6', fontSize: 13,
                fontWeight: '600', fontFamily: 'Poppins-SemiBold' }}>You're all set</Text>
            </View>
            <Text style={{ color: mutedFg, fontSize: 13, fontFamily: 'Poppins', lineHeight: 20 }}>
              Profile complete. You can now compare tariffs, generate quotes, and manage your clients.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Fixed bottom button — always visible ── */}
      <Animated.View style={[{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: bg,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#1E3A52' : '#E2EAF0',
      }, sb]}>
        {error ? (
          <View style={{
            backgroundColor: '#E24B4A15', borderRadius: 10,
            padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E24B4A30',
          }}>
            <Text style={{ color: '#E24B4A', fontSize: 13, fontFamily: 'Poppins' }}>{error}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={handleComplete}
          disabled={isLoading}
          style={{ backgroundColor: '#2272A6', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            {isLoading ? 'Completing setup...' : 'Complete Setup'}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}
