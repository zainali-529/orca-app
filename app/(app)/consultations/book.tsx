/**
 * Book Consultation Screen
 *
 * Flow:
 * 1. User picks category → duration → meeting method → notes
 * 2. Tap "Book & Pay £X" → POST /api/consultations → gets clientSecret
 * 3. initPaymentSheet(clientSecret) → presentPaymentSheet()
 * 4. On success → webhook fires (async) → navigate to confirmation
 *
 * Stripe React Native SDK used for Payment Sheet.
 * Install: npx expo install @stripe/stripe-react-native
 * Wrap app root with: <StripeProvider publishableKey={...}>
 */

import { Text }                   from '@/components/ui/text';
import { useConsultationStore }   from '@/lib/store/consultation.store';
import type { CategoryOption, ConsultationCategory, MeetingMethod, TimeSlot } from '@/lib/types/consultation.types';
import { router }                 from 'expo-router';
import { useColorScheme }         from 'nativewind';
import * as React                 from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useStripe }              from '@stripe/stripe-react-native';
import Svg, { Path }              from 'react-native-svg';

// ─── Category card ─────────────────────────────────────────────────

function CategoryCard({
  option, selected, onSelect,
}: {
  option:   CategoryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} className="w-[48%]">
      <View className={[
        'rounded-card p-3.5 border',
        selected
          ? 'bg-primary/8 dark:bg-brand-selected/30 border-primary'
          : 'bg-card border-border',
      ].join(' ')}
        style={{ borderWidth: selected ? 1.5 : 1 }}
      >
        <Text style={{ fontSize: 22 }} className="mb-1.5">{option.icon}</Text>
        <Text className={[
          'text-sm font-bold mb-0.5',
          selected ? 'text-primary' : 'text-brand dark:text-brand-fg',
        ].join(' ')} numberOfLines={2}>
          {option.title}
        </Text>
        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted" numberOfLines={2}>
          {option.description}
        </Text>
        <View className="mt-2 bg-primary/10 rounded-md px-2 py-0.5 self-start">
          <Text className="text-xs font-bold text-primary">
            from £{option.minPrice}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Duration chip ─────────────────────────────────────────────────

function DurationChip({
  duration, price, label, selected, onSelect,
}: {
  duration: 30 | 45 | 60;
  price:    number;
  label:    string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} className="flex-1">
      <View
        className={[
          'rounded-xl p-3 items-center border',
          selected ? 'bg-primary/10 border-primary' : 'bg-card border-border',
        ].join(' ')}
        style={{ borderWidth: selected ? 1.5 : 1 }}
      >
        <Text className={`text-lg font-bold ${selected ? 'text-primary' : 'text-brand dark:text-brand-fg'}`}>
          {duration}
        </Text>
        <Text className={`text-xs font-sans ${selected ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted'}`}>
          min
        </Text>
        <View className="mt-1.5 bg-primary/8 rounded-md px-2 py-0.5">
          <Text className="text-xs font-bold text-primary">£{price}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Meeting method chip ───────────────────────────────────────────

function MethodChip({
  id, label, icon, selected, onSelect,
}: {
  id: MeetingMethod; label: string; icon: string;
  selected: boolean; onSelect: () => void;
}) {
  return (
    <Pressable onPress={onSelect} className="flex-1">
      <View className={[
        'p-3 rounded-xl items-center gap-1.5 border',
        selected ? 'border-primary bg-primary/7 dark:bg-brand-selected/20' : 'border-border bg-card',
      ].join(' ')}>
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Text className={`text-xs font-sans ${selected ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Time slot chip ────────────────────────────────────────────────

function SlotChip({
  id, label, selected, onToggle,
}: {
  id: TimeSlot; label: string; selected: boolean; onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle}>
      <View className={[
        'px-3 py-2 rounded-xl border',
        selected ? 'border-primary bg-primary/8' : 'border-border bg-card',
      ].join(' ')}>
        <Text className={`text-xs font-semibold ${selected ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function BookConsultationScreen() {
  const { options, isLoadingOptions, isBooking, loadOptions, book } = useConsultationStore();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';

  const [selectedCategory, setSelectedCategory] = React.useState<ConsultationCategory>('general');
  const [selectedDuration, setSelectedDuration] = React.useState<30 | 45 | 60>(45);
  const [meetingMethod,    setMeetingMethod]     = React.useState<MeetingMethod>('phone');
  const [timeSlots,        setTimeSlots]         = React.useState<TimeSlot[]>([]);
  const [notes,            setNotes]             = React.useState('');
  const [isPaying,         setIsPaying]          = React.useState(false);
  const [error,            setError]             = React.useState('');

  React.useEffect(() => { loadOptions(); }, []);

  // When category changes, reset duration if not available
  React.useEffect(() => {
    const cat = options.find((o) => o.category === selectedCategory);
    if (cat && !cat.options.find((o) => o.duration === selectedDuration)) {
      setSelectedDuration(cat.options[0]?.duration ?? 45);
    }
  }, [selectedCategory, options]);

  const selectedCatData = options.find((o) => o.category === selectedCategory);
  const selectedPricing = selectedCatData?.options.find((o) => o.duration === selectedDuration);

  const toggleSlot = (slot: TimeSlot) => {
    setTimeSlots((prev) =>
      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot]
    );
  };

  const handleBookAndPay = async () => {
    if (!selectedPricing) {
      setError('Please select a valid category and duration.');
      return;
    }

    setError('');
    setIsPaying(true);

    try {
      // ── Step 1: Create consultation + get clientSecret ────────
      const result = await book({
        category:           selectedCategory,
        duration:           selectedDuration,
        meetingMethod,
        preferredTimeSlots: timeSlots,
        clientNotes:        notes.trim() || null,
      });

      // ── Step 2: Init Stripe Payment Sheet ────────────────────
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName:       'Energy Broker',
        style:                     colorScheme === 'dark' ? 'alwaysDark' : 'automatic',
        defaultBillingDetails:     { name: '' },
      });

      if (initError) {
        setError(initError.message ?? 'Failed to initialise payment.');
        setIsPaying(false);
        return;
      }

      // ── Step 3: Present Payment Sheet ────────────────────────
      const { error: payError } = await presentPaymentSheet();

      if (payError) {
        if (payError.code === 'Canceled') {
          // User closed the sheet — not an error, just return
          setIsPaying(false);
          return;
        }
        setError(payError.message ?? 'Payment failed. Please try again.');
        setIsPaying(false);
        return;
      }

      // ── Step 4: Payment sheet dismissed successfully ──────────
      // Webhook will update status to payment_confirmed asynchronously.
      // Navigate to detail screen to show status.
      router.replace(`/(app)/consultations/${result.consultation._id}` as any);

    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Something went wrong. Please try again.');
      setIsPaying(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Consultations</Text>
        </Pressable>
        <Text className="text-xl font-bold text-brand-fg">Book a Consultation</Text>
        <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
          1-on-1 session with our energy experts
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 160 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Category selection ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
            What do you need help with?
          </Text>
          <View className="flex-row flex-wrap gap-2.5">
            {options.map((opt) => (
              <CategoryCard
                key={opt.category}
                option={opt}
                selected={selectedCategory === opt.category}
                onSelect={() => setSelectedCategory(opt.category)}
              />
            ))}
          </View>
        </View>

        {/* ── Duration + price selection ── */}
        {selectedCatData && (
          <View className="bg-card rounded-card p-4 border border-border mb-3.5">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Session Length
            </Text>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
              Longer sessions allow for deeper analysis and more questions.
            </Text>
            <View className="flex-row gap-2.5">
              {selectedCatData.options.map((opt) => (
                <DurationChip
                  key={opt.duration}
                  duration={opt.duration as 30 | 45 | 60}
                  price={opt.price}
                  label={opt.label}
                  selected={selectedDuration === opt.duration}
                  onSelect={() => setSelectedDuration(opt.duration as 30 | 45 | 60)}
                />
              ))}
            </View>
          </View>
        )}

        {/* ── Meeting method ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
            How would you like to meet?
          </Text>
          <View className="flex-row gap-2">
            <MethodChip id="phone"     label="Phone"     icon="📞" selected={meetingMethod === 'phone'}     onSelect={() => setMeetingMethod('phone')} />
            <MethodChip id="video"     label="Video Call" icon="💻" selected={meetingMethod === 'video'}     onSelect={() => setMeetingMethod('video')} />
            <MethodChip id="in_person" label="In Person"  icon="📍" selected={meetingMethod === 'in_person'} onSelect={() => setMeetingMethod('in_person')} />
          </View>
        </View>

        {/* ── Preferred time ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            Preferred Time Slots
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
            Optional — helps us schedule at a convenient time.
          </Text>
          <View className="flex-row gap-2 flex-wrap">
            {([
              { id: 'morning', label: '🌅 Morning (9am–12pm)' },
              { id: 'afternoon', label: '☀️ Afternoon (12–5pm)' },
              { id: 'evening', label: '🌆 Evening (5–8pm)' },
            ] as const).map((slot) => (
              <SlotChip
                key={slot.id}
                id={slot.id}
                label={slot.label}
                selected={timeSlots.includes(slot.id)}
                onToggle={() => toggleSlot(slot.id)}
              />
            ))}
          </View>
        </View>

        {/* ── Notes ── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            Anything to add? (optional)
          </Text>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-3">
            Tell us about your situation so we can prepare.
          </Text>
          <View className="bg-background dark:bg-card/50 border border-border rounded-banner overflow-hidden">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. We have 3 meters, contract renewals in March, interested in green energy options..."
              placeholderTextColor="#A0B4C0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ padding: 12, fontSize: 14, fontFamily: 'Poppins', color: textColor, minHeight: 90 }}
            />
          </View>
        </View>

        {/* ── Price summary ── */}
        {selectedPricing && (
          <View className="bg-primary/6 dark:bg-brand-selected rounded-card p-4 border border-primary/15 mb-3.5">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-semibold text-brand dark:text-brand-fg">
                {selectedPricing.label}
              </Text>
              <Text className="text-xl font-bold text-primary">£{selectedPricing.price}</Text>
            </View>
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              One-time payment · Secure checkout by Stripe
            </Text>
          </View>
        )}

        {/* ── Secure payment badge ── */}
        <View className="flex-row items-center gap-2 mb-3.5 px-1">
          <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <Path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6L12 2z"
              fill="#2DD4A0" opacity="0.8" />
          </Svg>
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
            Secured by Stripe. Your card details are never stored on our servers.
          </Text>
        </View>

        {/* ── Error ── */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            <Text className="text-destructive text-sm font-sans">{error}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* ── CTA ── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border">
        <Pressable
          onPress={handleBookAndPay}
          disabled={isPaying || isBooking || !selectedPricing}
          className={[
            'bg-primary h-14 rounded-card items-center justify-center flex-row gap-2',
            (isPaying || isBooking || !selectedPricing) ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          {isPaying || isBooking ? (
            <>
              <ActivityIndicator color="#fff" />
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                {isBooking ? 'Preparing…' : 'Processing Payment…'}
              </Text>
            </>
          ) : (
            <>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M12 2L3 6v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V6L12 2z"
                  fill="#ffffff" opacity="0.9" />
              </Svg>
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                Book & Pay {selectedPricing ? `£${selectedPricing.price}` : ''}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}