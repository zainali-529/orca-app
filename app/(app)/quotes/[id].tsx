import { Text } from '@/components/ui/text';
import { useQuoteStore } from '@/lib/store/quote.store';
import type { QuoteRequestStatus } from '@/lib/types/quote.types';
import { router, useLocalSearchParams } from 'expo-router';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<QuoteRequestStatus, {
  label: string; emoji: string; desc: string;
  bgClass: string; textClass: string; step: number;
}> = {
  pending:   {
    label: 'Pending',   emoji: '⏳',
    desc:  'Your request has been received. Our team will be in touch shortly.',
    bgClass: 'bg-primary/13',   textClass: 'text-primary',     step: 1,
  },
  contacted: {
    label: 'Contacted', emoji: '📞',
    desc:  'Our team has reached out to you. Check your messages!',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal',  step: 2,
  },
  completed: {
    label: 'Completed', emoji: '✅',
    desc:  'Your energy switch has been successfully completed.',
    bgClass: 'bg-brand-green/10', textClass: 'text-brand-green', step: 3,
  },
  cancelled: {
    label: 'Cancelled', emoji: '❌',
    desc:  'This quote request has been cancelled.',
    bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted', step: 0,
  },
};

// ─── Progress steps ───────────────────────────────────────────────────────────

const STEPS = [
  { step: 1, label: 'Submitted',  icon: '📋' },
  { step: 2, label: 'Contacted',  icon: '📞' },
  { step: 3, label: 'Completed',  icon: '✅' },
];

function ProgressTracker({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null; // cancelled

  return (
    <View className="flex-row items-center justify-between px-2">
      {STEPS.map((s, i) => {
        const done   = s.step < currentStep;
        const active = s.step === currentStep;

        return (
          <React.Fragment key={s.step}>
            {/* Step circle */}
            <View className="items-center gap-1.5" style={{ flex: i < STEPS.length - 1 ? undefined : undefined }}>
              <View
                className={[
                  'w-10 h-10 rounded-full items-center justify-center',
                  done   ? 'bg-brand-teal/10 border border-brand-teal/30' :
                  active ? 'bg-primary/13 border border-primary/30' :
                           'bg-muted dark:bg-border/20 border border-border',
                ].join(' ')}
              >
                <Text style={{ fontSize: done ? 16 : active ? 16 : 12 }}>
                  {done ? '✅' : active ? s.icon : '○'}
                </Text>
              </View>
              <Text
                className={[
                  'text-xs font-sans text-center',
                  done || active
                    ? 'text-brand dark:text-brand-fg font-semibold'
                    : 'text-[#4A6A82] dark:text-brand-fg-muted',
                ].join(' ')}
              >
                {s.label}
              </Text>
            </View>

            {/* Connector line */}
            {i < STEPS.length - 1 && (
              <View
                className={['flex-1 h-0.5 mx-2 mb-5',
                  s.step < currentStep ? 'bg-brand-teal/40' : 'bg-border'].join(' ')}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-border">
      <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted flex-1 mr-4">
        {label}
      </Text>
      <Text className="text-sm font-medium text-brand dark:text-brand-fg flex-1 text-right">
        {value}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function QuoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { selectedQuote, isLoadingDetail, isUpdating, loadQuote, cancelQuote, deleteQuote } =
    useQuoteStore();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    if (id) loadQuote(id);
  }, [id]);

  React.useEffect(() => {
    if (selectedQuote) {
      opacity.value    = withDelay(100, withSpring(1, { damping: 20 }));
      translateY.value = withDelay(100, withSpring(0, { damping: 18 }));
    }
  }, [selectedQuote]);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!selectedQuote) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">Request not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-banner px-5 py-2.5">
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const q      = selectedQuote;
  const cfg    = STATUS_CONFIG[q.status];
  const hasTariff  = !!q.interestedTariff?.supplier;
  const hasSaving  = typeof q.interestedTariff?.estimatedAnnualSaving === 'number'
    && (q.interestedTariff.estimatedAnnualSaving ?? 0) > 0;
  const isPending  = q.status === 'pending';
  const isCancelled = q.status === 'cancelled';

  const createdDate = new Date(q.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this quote request?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel request',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelQuote(q._id);
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Could not cancel request.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Request',
      'Permanently delete this quote request?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteQuote(q._id);
              router.back();
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.message ?? 'Could not delete request.');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header — always brand navy ─── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">My Quotes</Text>
        </Pressable>

        {/* Quote number + status */}
        <View className="flex-row items-center gap-2 mb-1">
          <Text className="text-xs font-bold text-brand-blue-bright">{q.quoteNumber}</Text>
          <View className={`px-2 py-0.5 rounded-full flex-row items-center gap-1 ${cfg.bgClass}`}>
            <Text className={`text-xs font-semibold ${cfg.textClass}`}>
              {cfg.emoji} {cfg.label}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-bold text-brand-fg">
          {hasTariff ? q.interestedTariff.supplier! : 'General Quote Request'}
        </Text>
        {hasTariff && (
          <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
            {q.interestedTariff.tariffName}
          </Text>
        )}
        <Text className="text-xs font-sans mt-1 text-brand-fg-muted">Submitted {createdDate}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={contentStyle} className="gap-3">

          {/* ── Status tracker ─── */}
          {!isCancelled && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-4">
                Request Status
              </Text>
              <ProgressTracker currentStep={cfg.step} />
              <View className={`mt-4 p-3 rounded-xl ${cfg.bgClass} border border-transparent`}>
                <Text className={`text-sm font-sans leading-5 ${cfg.textClass}`}>
                  {cfg.desc}
                </Text>
              </View>
            </View>
          )}

          {/* ── Cancelled notice ─── */}
          {isCancelled && (
            <View className="bg-destructive/8 rounded-card p-4 border border-destructive/20">
              <Text className="text-sm font-semibold text-destructive mb-1">❌ Request Cancelled</Text>
              <Text className="text-sm font-sans text-destructive/80">
                This quote request was cancelled.
                {q.cancelledAt
                  ? ` Cancelled on ${new Date(q.cancelledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}.`
                  : ''}
              </Text>
            </View>
          )}

          {/* ── Savings estimate ─── */}
          {hasSaving && !isCancelled && (
            <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-sans text-brand-teal mb-0.5">💰 Estimated saving</Text>
                  <Text className="text-xl font-bold text-brand-teal">
                    £{Math.round(q.interestedTariff.estimatedAnnualSaving!).toLocaleString()} / year
                  </Text>
                </View>
                {q.interestedTariff.estimatedAnnualCost && (
                  <View className="items-end">
                    <Text className="text-xs font-sans text-brand-teal">Est. annual</Text>
                    <Text className="text-lg font-bold text-brand-teal">
                      £{q.interestedTariff.estimatedAnnualCost.toLocaleString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* ── Tariff details ─── */}
          {hasTariff && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">Tariff Details</Text>
              <InfoRow label="Supplier"   value={q.interestedTariff.supplier} />
              <InfoRow label="Tariff"     value={q.interestedTariff.tariffName} />
              <InfoRow label="Type"       value={q.interestedTariff.tariffType} />
              <InfoRow label="Fuel"       value={q.interestedTariff.fuelType} />
              <InfoRow label="Green"      value={q.interestedTariff.isGreen ? '🌿 Yes — renewable' : 'Standard'} />
              {q.interestedTariff.estimatedAnnualCost && (
                <InfoRow
                  label="Est. annual cost"
                  value={`£${q.interestedTariff.estimatedAnnualCost.toLocaleString()}`}
                />
              )}
            </View>
          )}

          {/* ── Your preferences ─── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">Your Preferences</Text>
            {q.preferences.fuelType && (
              <InfoRow label="Fuel type"    value={q.preferences.fuelType} />
            )}
            <InfoRow label="Green energy"  value={q.preferences.preferGreen ? 'Yes' : 'No preference'} />
            <InfoRow label="Fixed tariff"  value={q.preferences.preferFixed ? 'Preferred' : 'No preference'} />
          </View>

          {/* ── Energy snapshot ─── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Energy Details Submitted
            </Text>
            <InfoRow label="Current elec supplier" value={q.energySnapshot.currentElectricitySupplier} />
            <InfoRow label="Current gas supplier"  value={q.energySnapshot.currentGasSupplier} />
            {q.energySnapshot.annualElectricityKwh && (
              <InfoRow label="Annual elec usage" value={`${q.energySnapshot.annualElectricityKwh.toLocaleString()} kWh`} />
            )}
            {q.energySnapshot.annualGasKwh && (
              <InfoRow label="Annual gas usage" value={`${q.energySnapshot.annualGasKwh.toLocaleString()} kWh`} />
            )}
            {q.energySnapshot.mpan && (
              <InfoRow label="MPAN" value={q.energySnapshot.mpan} />
            )}
            {q.energySnapshot.mprn && (
              <InfoRow label="MPRN" value={q.energySnapshot.mprn} />
            )}
            {q.energySnapshot.postcode && (
              <InfoRow label="Postcode" value={q.energySnapshot.postcode} />
            )}
          </View>

          {/* ── Contact details ─── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">Contact Details</Text>
            <InfoRow label="Name"            value={q.contactDetails.name} />
            <InfoRow label="Email"           value={q.contactDetails.email} />
            <InfoRow label="Phone"           value={q.contactDetails.phone} />
            <InfoRow
              label="Preferred contact"
              value={q.contactDetails.preferredContactMethod
                ? { email: '📧 Email', phone: '📞 Phone', whatsapp: '💬 WhatsApp' }[q.contactDetails.preferredContactMethod]
                : undefined
              }
            />
            {q.contactDetails.bestTimeToContact && (
              <InfoRow label="Best time" value={q.contactDetails.bestTimeToContact} />
            )}
          </View>

          {/* ── Message ─── */}
          {q.message && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2">Your Message</Text>
              <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted">
                "{q.message}"
              </Text>
            </View>
          )}

          {/* ── Actions ─── */}
          {isPending && !isUpdating && (
            <View className="gap-2.5">
              <Pressable
                onPress={handleCancel}
                className="bg-destructive/10 border border-destructive/20 h-11 rounded-banner items-center justify-center"
              >
                <Text className="text-sm font-semibold text-destructive">Cancel Quote Request</Text>
              </Pressable>
            </View>
          )}

          {isUpdating && (
            <View className="items-center py-3">
              <ActivityIndicator color="#2272A6" />
            </View>
          )}

          {isCancelled && (
            <Pressable onPress={handleDelete} className="items-center py-3">
              <Text className="text-sm font-semibold text-destructive">Delete this request</Text>
            </Pressable>
          )}

          {/* ── CTA: Request a new quote ─── */}
          {(isCancelled || q.status === 'completed') && (
            <Pressable
              onPress={() => router.push('/(app)/quotes/create' as any)}
              className="bg-primary h-12 rounded-card items-center justify-center mt-1"
            >
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                Request Another Quote
              </Text>
            </Pressable>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}