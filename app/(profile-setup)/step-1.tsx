import { SetupHeader } from '@/components/shared/setup-header';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ScrollView, Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

type BusinessType = 'residential' | 'sme' | 'commercial' | 'industrial';

const TYPES: { id: BusinessType; label: string; desc: string; icon: string }[] = [
  { id: 'residential', label: 'Residential',  desc: 'Home energy usage',              icon: '🏠' },
  { id: 'sme',         label: 'SME',          desc: 'Small to medium business',       icon: '🏢' },
  { id: 'commercial',  label: 'Commercial',   desc: 'Large commercial premises',      icon: '🏬' },
  { id: 'industrial',  label: 'Industrial',   desc: 'Manufacturing & heavy industry', icon: '🏭' },
];

function TypeCard({
  item,
  selected,
  onSelect,
  isDark,
}: {
  item: typeof TYPES[0];
  selected: boolean;
  onSelect: () => void;
  isDark: boolean;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    onSelect();
  };

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <Pressable onPress={handlePress}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 16,
          borderRadius: 14,
          borderWidth: selected ? 1.5 : 1,
          borderColor: selected
            ? '#2272A6'
            : isDark ? '#1E3A52' : '#D5DEE8',
          backgroundColor: selected
            ? isDark ? '#1A3A54' : '#EDF5FB'
            : isDark ? '#132030' : '#FFFFFF',
          gap: 14,
        }}>
          {/* Icon */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: selected
              ? '#2272A620'
              : isDark ? '#0D2C40' : '#F0F6FB',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 15,
              fontWeight: '600',
              color: selected ? '#2272A6' : isDark ? '#F0F8FF' : '#0D2C40',
              fontFamily: 'Poppins-SemiBold',
            }}>
              {item.label}
            </Text>
            <Text style={{
              fontSize: 13,
              marginTop: 2,
              color: isDark ? '#7AAEC8' : '#4A6A82',
              fontFamily: 'Poppins',
            }}>
              {item.desc}
            </Text>
          </View>

          {/* Check circle */}
          <View style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: selected ? 0 : 1.5,
            borderColor: isDark ? '#1E3A52' : '#C8DCE9',
            backgroundColor: selected ? '#2272A6' : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {selected && (
              <Svg width="13" height="13" viewBox="0 0 13 13">
                <Path d="M2.5 6.5l3 3 5-5" fill="none" stroke="#fff"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function Step1Screen() {
  const { saveStep1, isLoading, profile, loadProfile, onboardingStatus } = useProfileStore();

  // Load profile on mount so previous selection is available on cold start
  React.useEffect(() => {
    loadProfile();
  }, []);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selected, setSelected] = React.useState<BusinessType | null>(null);
  const [apiError, setApiError] = React.useState('');

  // Sync selection when profile loads (cold start)
  React.useEffect(() => {
    if (profile?.businessType && !selected) {
      setSelected(profile.businessType as BusinessType);
    }
  }, [profile?.businessType]);

  const handleContinue = async () => {
    if (!selected) {
      setApiError('Please select a business type to continue');
      return;
    }
    setApiError('');
    try {
      await saveStep1({ businessType: selected });
      router.push(selected === 'residential'
        ? '/(profile-setup)/step-3'
        : '/(profile-setup)/step-2'
      );
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? 'Something went wrong';
      const errs = e?.response?.data?.errors;
      if (errs) {
        const firstErr = Object.values(errs)[0] as string;
        setApiError(firstErr);
      } else {
        setApiError(msg);
      }
    }
  };

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SetupHeader
        currentStep={1}
        totalSteps={5}
        title="What type of energy user are you?"
        subtitle="This helps us show the most relevant tariffs and options."
      />

      {/* Scrollable cards area */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        {TYPES.map((t) => (
          <TypeCard
            key={t.id}
            item={t}
            selected={selected === t.id}
            onSelect={() => {
              setSelected(t.id);
              setApiError('');
            }}
            isDark={isDark}
          />
        ))}

        <Text style={{
          color: mutedFg, fontSize: 12, textAlign: 'center',
          marginTop: 8, lineHeight: 18, fontFamily: 'Poppins',
        }}>
          You can update this at any time from your profile settings
        </Text>
      </ScrollView>

      {/* ── Fixed bottom button — always visible ── */}
      <View style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: bg,
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 36,
        borderTopWidth: 1,
        borderTopColor: isDark ? '#1E3A52' : '#E2EAF0',
        zIndex: 100,
      }}>
        {apiError ? (
          <View style={{
            backgroundColor: '#E24B4A15', borderRadius: 10,
            padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E24B4A30',
          }}>
            <Text style={{ color: '#E24B4A', fontSize: 13, fontFamily: 'Poppins' }}>{apiError}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={handleContinue}
          disabled={isLoading || !selected}
          style={{
            backgroundColor: '#2272A6',
            height: 52,
            borderRadius: 14,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: (isLoading || !selected) ? 0.7 : 1
          }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 15,
            fontWeight: '700',
            fontFamily: 'Poppins-Bold',
          }}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
