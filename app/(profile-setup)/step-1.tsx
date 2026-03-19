import { SetupHeader } from '@/components/shared/setup-header';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { router } from 'expo-router';
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

// ─── Type Card ────────────────────────────────────────────────────────────────

function TypeCard({
  item,
  selected,
  onSelect,
}: {
  item: typeof TYPES[0];
  selected: boolean;
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 14 });
    });
    onSelect();
  };

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={animStyle}>
      <Pressable onPress={handlePress}>

        {/* Card container
            rounded-card  = 14px   (config › borderRadius.card)
            gap-3.5       = 14px   (Tailwind default › 3.5 × 4px)
            borderWidth 1.5 selected — no Tailwind step, kept as style prop */}
        <View
          className={[
            'flex-row items-center p-4 rounded-card gap-3.5',
            selected
              ? 'border-primary bg-primary/[0.07] dark:bg-brand-selected/[0.13]'
              : 'border-border bg-card',
          ].join(' ')}
          style={{ borderWidth: selected ? 1.5 : 1 }}
        >

          {/* Icon bubble
              bg-primary/6  = 6% opacity   (config › opacity.6)
              bg-primary/13 = 13% opacity  (config › opacity.13) */}
          <View
            className={[
              'w-12 h-12 rounded-xl items-center justify-center',
              selected
                ? 'bg-primary/6 dark:bg-brand'
                : 'bg-primary/13',
            ].join(' ')}
          >
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
          </View>

          {/* Label + description */}
          <View className="flex-1">
            {/* text-base = 15px / 22px lh  (config › fontSize.15) */}
            <Text
              className={[
                'text-base font-semibold',
                selected ? 'text-primary' : 'text-brand dark:text-brand-fg',
              ].join(' ')}
            >
              {item.label}
            </Text>

            {/* text-xs = 12px, leading-normal = 1.5 → 18px lh (Tailwind default) */}
            <Text className="text-xs mt-0.5 leading-normal text-[#4A6A82] dark:text-brand-fg-muted font-sans">
              {item.desc}
            </Text>
          </View>

          {/* Check circle
              w-6 / h-6 = 24px (Tailwind default)
              borderWidth 1.5 unchecked — kept as style prop                */}
          <View
            className={[
              'w-6 h-6 rounded-full items-center justify-center',
              selected ? 'bg-primary' : 'border-border',
            ].join(' ')}
            style={{ borderWidth: selected ? 0 : 1.5 }}
          >
            {selected && (
              <Svg width="13" height="13" viewBox="0 0 13 13">
                <Path
                  d="M2.5 6.5l3 3 5-5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>

        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Step1Screen() {
  const { saveStep1, isLoading, profile, loadProfile } = useProfileStore();

  React.useEffect(() => {
    loadProfile();
  }, []);

  const [selected, setSelected] = React.useState<BusinessType | null>(null);
  const [apiError, setApiError]  = React.useState('');

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
      router.push(
        selected === 'residential'
          ? '/(profile-setup)/step-3'
          : '/(profile-setup)/step-2',
      );
    } catch (e: any) {
      const msg  = e?.response?.data?.message ?? 'Something went wrong';
      const errs = e?.response?.data?.errors;
      if (errs) {
        setApiError(Object.values(errs)[0] as string);
      } else {
        setApiError(msg);
      }
    }
  };

  return (
    <View className="flex-1 bg-background">

      <SetupHeader
        currentStep={1}
        totalSteps={5}
        title="What type of energy user are you?"
        subtitle="This helps us show the most relevant tariffs and options."
      />

      {/* ── Scrollable card list ─────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 10, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {TYPES.map((t) => (
          <TypeCard
            key={t.id}
            item={t}
            selected={selected === t.id}
            onSelect={() => {
              setSelected(t.id);
              setApiError('');
            }}
          />
        ))}

        {/* text-xs = 12px, leading-normal → 18px lh (1.5 × 12) */}
        <Text className="text-xs text-center mt-2 leading-normal text-muted-foreground font-sans">
          You can update this at any time from your profile settings
        </Text>
      </ScrollView>

      {/* ── Fixed bottom bar ─────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border z-50">

        {/* Error banner
            bg-destructive/8 = 8% opacity  (config › opacity.8)
            rounded-banner   = 10px        (config › borderRadius.banner)  */}
        {apiError ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            {/* text-sm = 13px / 18px lh  (config › fontSize.13) */}
            <Text className="text-destructive text-sm font-sans">
              {apiError}
            </Text>
          </View>
        ) : null}

        {/* CTA button
            h-13         = 52px  (Tailwind default › 13 × 4px)
            rounded-card = 14px  (config › borderRadius.card)             */}
        <Pressable
  onPress={handleContinue}
  disabled={isLoading || !selected}
  className={[
    'bg-primary h-12 rounded-card items-center justify-center',
    (isLoading || !selected) ? 'opacity-70' : 'opacity-100',
  ].join(' ')}
>
  <Text className="text-white text-base font-bold" style={{ color: '#ffffff' }}>
    {isLoading ? 'Saving...' : 'Continue'}
  </Text>
</Pressable>

      </View>
    </View>
  );
}