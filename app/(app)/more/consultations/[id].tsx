/**
 * Consultation Detail Screen
 *
 * Shows full lifecycle of a consultation:
 * - awaiting_payment: "Complete Payment" button (opens Stripe sheet again)
 * - payment_failed:   "Retry Payment" button
 * - confirmed/scheduled: Meeting details + countdown
 * - completed: Outcome + next steps + rating section
 * - cancelled/refunded: Summary
 */

import { Text }                   from '@/components/ui/text';
import { useConsultationStore }   from '@/lib/store/consultation.store';
import type { ConsultationStatus } from '@/lib/types/consultation.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme }         from 'nativewind';
import * as React                 from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import Animated, {
  useAnimatedStyle, useSharedValue,
  withDelay, withSpring, withTiming,
} from 'react-native-reanimated';
import Svg, { Path, Polygon } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CFG: Record<ConsultationStatus, {
  label: string; emoji: string;
  bgClass: string; textClass: string;
  desc: string; step: number;
}> = {
  requested:          { label: 'Submitted',        emoji: '📋', bgClass: 'bg-primary/13',           textClass: 'text-primary',                    step: 1, desc: 'Your consultation request has been received.' },
  awaiting_payment:   { label: 'Awaiting Payment', emoji: '💳', bgClass: 'bg-orange-500/10',         textClass: 'text-orange-400',                 step: 1, desc: 'Complete your payment to confirm the booking.' },
  payment_failed:     { label: 'Payment Failed',   emoji: '❌', bgClass: 'bg-destructive/8',         textClass: 'text-destructive',                step: 0, desc: 'Your payment was not successful. You can retry.' },
  payment_confirmed:  { label: 'Payment Done',     emoji: '✅', bgClass: 'bg-brand-teal/8',          textClass: 'text-brand-teal',                 step: 2, desc: 'Payment received. Our team will confirm your session shortly.' },
  confirmed:          { label: 'Confirmed',        emoji: '✅', bgClass: 'bg-brand-teal/8',          textClass: 'text-brand-teal',                 step: 2, desc: 'Your consultation is confirmed. Scheduling details coming soon.' },
  scheduled:          { label: 'Scheduled',        emoji: '📅', bgClass: 'bg-brand-blue-bright/10',  textClass: 'text-brand-blue-bright',          step: 3, desc: 'Your session is scheduled. Details below.' },
  in_progress:        { label: 'In Progress',      emoji: '🎙️', bgClass: 'bg-primary/13',            textClass: 'text-primary',                    step: 3, desc: 'Your consultation is happening now.' },
  completed:          { label: 'Completed',        emoji: '✅', bgClass: 'bg-brand-teal/8',          textClass: 'text-brand-teal',                 step: 4, desc: 'Session complete. Your summary is below.' },
  cancelled:          { label: 'Cancelled',        emoji: '❌', bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted', step: 0, desc: 'This consultation was cancelled.' },
  no_show:            { label: 'No Show',          emoji: '⚠️', bgClass: 'bg-orange-500/10',         textClass: 'text-orange-400',                 step: 0, desc: 'This session was marked as no-show.' },
  refunded:           { label: 'Refunded',         emoji: '💰', bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted', step: 0, desc: 'Your payment has been refunded.' },
};

const PROGRESS_STEPS = [
  { step: 1, label: 'Booked'   },
  { step: 2, label: 'Confirmed' },
  { step: 3, label: 'Session'   },
  { step: 4, label: 'Complete'  },
];

// ─── Progress tracker ──────────────────────────────────────────────

function ProgressTracker({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;
  return (
    <View className="relative">
      <View className="absolute top-[18px] left-[18px] right-[18px] h-0.5 bg-border" />
      <View className="flex-row justify-between">
        {PROGRESS_STEPS.map((s) => {
          const done   = s.step < currentStep;
          const active = s.step === currentStep;
          return (
            <View key={s.step} className="items-center gap-1.5 flex-1">
              <View className={[
                'w-9 h-9 rounded-full items-center justify-center z-10',
                done   ? 'bg-brand-teal/15 border border-brand-teal/40' :
                active ? 'bg-primary/15 border-2 border-primary' :
                         'bg-muted dark:bg-border/20 border border-border',
              ].join(' ')}>
                {done
                  ? <Svg width="14" height="14" viewBox="0 0 14 14"><Path d="M2.5 7l3 3L11 3.5" fill="none" stroke="#2DD4A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  : active ? <View className="w-2 h-2 rounded-full bg-primary" />
                  : <View className="w-1.5 h-1.5 rounded-full bg-border" />
                }
              </View>
              <Text className={[
                'text-xs text-center',
                done || active ? 'font-semibold text-brand dark:text-brand-fg' : 'font-sans text-[#4A6A82] dark:text-brand-fg-muted',
              ].join(' ')}>
                {s.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Info row ──────────────────────────────────────────────────────

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

// ─── Star rating ───────────────────────────────────────────────────

function StarRating({
  consultationId, onSubmit, isSubmitting,
}: {
  consultationId: string;
  onSubmit:       (rating: number, comment?: string) => Promise<void>;
  isSubmitting:   boolean;
}) {
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';
  const [selected, setSelected]   = React.useState(0);
  const [comment,  setComment]    = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  if (submitted) {
    return (
      <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/20">
        <Text className="text-sm font-bold text-brand-teal text-center">
          ⭐ Thank you for your feedback!
        </Text>
      </View>
    );
  }

  return (
    <View className="bg-card rounded-card p-4 border border-border">
      <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
        Rate Your Session
      </Text>
      <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-4">
        How was your consultation experience?
      </Text>

      {/* Stars */}
      <View className="flex-row gap-2 justify-center mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setSelected(star)} hitSlop={8}>
            <Svg width="36" height="36" viewBox="0 0 24 24">
              <Polygon
                points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                fill={star <= selected ? '#F59E0B' : 'none'}
                stroke={star <= selected ? '#F59E0B' : '#D1D5DB'}
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </Svg>
          </Pressable>
        ))}
      </View>

      {selected > 0 && (
        <>
          <View className="bg-background dark:bg-card/50 border border-border rounded-banner overflow-hidden mb-3">
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Any comments? (optional)"
              placeholderTextColor="#A0B4C0"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ padding: 12, fontSize: 13, fontFamily: 'Poppins', color: textColor, minHeight: 64 }}
            />
          </View>
          <Pressable
            onPress={async () => {
              await onSubmit(selected, comment.trim() || undefined);
              setSubmitted(true);
            }}
            disabled={isSubmitting}
            className={['bg-primary h-10 rounded-banner items-center justify-center',
              isSubmitting ? 'opacity-70' : 'opacity-100'].join(' ')}
          >
            {isSubmitting
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Submit Rating</Text>
            }
          </Pressable>
        </>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function ConsultationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedConsultation, isLoadingDetail, isCancelling, isRetrying, isRating,
    loadConsultation, cancel, retryPayment, submitRating,
  } = useConsultationStore();
  const { colorScheme } = useColorScheme();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isPayingNow, setIsPayingNow] = React.useState(false);

  const contentOpacity = useSharedValue(0);
  const contentY       = useSharedValue(20);

  React.useEffect(() => {
    if (id) loadConsultation(id);
  }, [id]);

  React.useEffect(() => {
    if (selectedConsultation) {
      contentOpacity.value = withDelay(80, withTiming(1,  { duration: 350 }));
      contentY.value       = withDelay(80, withSpring(0,  { damping: 18 }));
    }
  }, [selectedConsultation]);

  const animStyle = useAnimatedStyle(() => ({
    opacity:   contentOpacity.value,
    transform: [{ translateY: contentY.value }],
  }));

  if (isLoadingDetail) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#2272A6" />
      </View>
    );
  }

  if (!selectedConsultation) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">Not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-banner px-5 py-2.5">
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const c   = selectedConsultation;
  const cfg = STATUS_CFG[c.status];

  const isAwaitingPayment = c.status === 'awaiting_payment';
  const isPaymentFailed   = c.status === 'payment_failed';
  const isScheduled       = ['confirmed', 'scheduled', 'in_progress'].includes(c.status);
  const isCompleted       = c.status === 'completed';
  const canCancelNow      = c.canCancel;
  const needsRating       = isCompleted && !c.rating;

  const createdDate = new Date(c.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  // Open Stripe payment sheet for awaiting_payment
  const handleCompletePayment = async () => {
    if (!c.payment?.stripePaymentIntentId) {
      Alert.alert('Error', 'Payment details not found. Please contact support.');
      return;
    }

    setIsPayingNow(true);
    try {
      // Need fresh clientSecret — re-request via retryPayment (or just init with stored PI)
      // For awaiting_payment, we need to get the clientSecret again
      const result = await retryPayment(c._id);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: result.clientSecret,
        merchantDisplayName:       'Energy Broker',
        style:                     colorScheme === 'dark' ? 'alwaysDark' : 'automatic',
      });

      if (initError) { Alert.alert('Error', initError.message); return; }

      const { error: payError } = await presentPaymentSheet();

      if (payError) {
        if (payError.code !== 'Canceled') {
          Alert.alert('Payment Failed', payError.message);
        }
        return;
      }

      // Refresh the consultation
      await loadConsultation(c._id);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Something went wrong.');
    } finally {
      setIsPayingNow(false);
    }
  };

  const handleCancel = () => {
    Alert.alert('Cancel Consultation', 'Are you sure you want to cancel this booking?', [
      { text: 'Keep it', style: 'cancel' },
      {
        text: 'Cancel Booking', style: 'destructive',
        onPress: async () => {
          try {
            await cancel(c._id);
            Alert.alert('Cancelled', 'Your consultation has been cancelled.');
          } catch (e: any) {
            Alert.alert('Error', e?.response?.data?.message ?? 'Could not cancel.');
          }
        },
      },
    ]);
  };

  const CATEGORY_LABELS: Record<string, string> = {
    general:         '💡 General Advice',
    tariff_review:   '📊 Tariff Review',
    switch_advice:   '🔄 Switch Advice',
    contract_review: '📋 Contract Review',
    energy_audit:    '🔍 Energy Audit',
    renewal_advice:  '📅 Renewal Advice',
    new_connection:  '🏢 New Connection',
  };

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Consultations</Text>
        </Pressable>

        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1 flex-wrap">
              <Text className="text-xs font-bold text-brand-blue-bright">
                {c.consultationNumber}
              </Text>
              <View className={`px-2 py-0.5 rounded-full ${cfg.bgClass}`}>
                <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                  {cfg.emoji} {cfg.label}
                </Text>
              </View>
            </View>
            <Text className="text-xl font-bold text-brand-fg" numberOfLines={2}>
              {c.label ?? `${c.duration} min Consultation`}
            </Text>
            <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
              {CATEGORY_LABELS[c.category]} · Booked {createdDate}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs font-sans text-brand-fg-muted">Total paid</Text>
            <Text className="text-xl font-bold text-brand-fg">£{c.price}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={animStyle} className="gap-3">

          {/* ── Progress tracker ── */}
          {cfg.step > 0 && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-4">
                Booking Progress
              </Text>
              <ProgressTracker currentStep={cfg.step} />
              <View className={`mt-4 p-3 rounded-xl ${cfg.bgClass}`}>
                <Text className={`text-sm font-sans leading-5 ${cfg.textClass}`}>
                  {cfg.desc}
                </Text>
              </View>
            </View>
          )}

          {/* ── Awaiting payment CTA ── */}
          {isAwaitingPayment && (
            <View className="bg-orange-500/10 rounded-card p-4 border border-orange-500/20">
              <Text className="text-sm font-bold text-orange-400 mb-2">
                💳 Complete Your Payment
              </Text>
              <Text className="text-sm font-sans text-orange-300 leading-5 mb-3">
                Your booking is reserved. Please complete payment to confirm your consultation.
              </Text>
              <Pressable
                onPress={handleCompletePayment}
                disabled={isPayingNow || isRetrying}
                className={[
                  'bg-primary h-12 rounded-banner items-center justify-center flex-row gap-2',
                  (isPayingNow || isRetrying) ? 'opacity-70' : 'opacity-100',
                ].join(' ')}
              >
                {isPayingNow || isRetrying
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                      Complete Payment · £{c.price}
                    </Text>
                }
              </Pressable>
            </View>
          )}

          {/* ── Payment failed CTA ── */}
          {isPaymentFailed && (
            <View className="bg-destructive/8 rounded-card p-4 border border-destructive/20">
              <Text className="text-sm font-bold text-destructive mb-2">❌ Payment Failed</Text>
              <Text className="text-sm font-sans text-destructive/80 leading-5 mb-3">
                Your payment was declined. Please try again with a different card or contact your bank.
              </Text>
              <Pressable
                onPress={handleCompletePayment}
                disabled={isPayingNow || isRetrying}
                className={[
                  'bg-destructive h-11 rounded-banner items-center justify-center flex-row gap-2',
                  (isPayingNow || isRetrying) ? 'opacity-70' : 'opacity-100',
                ].join(' ')}
              >
                {isPayingNow || isRetrying
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
                      Retry Payment · £{c.price}
                    </Text>
                }
              </Pressable>
              {c.paymentAttempts && c.paymentAttempts >= 3 && (
                <Text className="text-xs font-sans text-destructive/70 mt-2 text-center">
                  Maximum attempts reached. Please contact support.
                </Text>
              )}
            </View>
          )}

          {/* ── Scheduled meeting card ── */}
          {isScheduled && (c.scheduledAt || c.meetingLink || c.meetingPhone) && (
            <View className="bg-brand-blue-bright/8 rounded-card p-4 border border-brand-blue-bright/20">
              <Text className="text-sm font-bold text-brand-blue-bright mb-3">
                📅 Meeting Details
              </Text>
              {c.scheduledAt && (
                <View className="bg-card rounded-xl p-3 mb-2.5">
                  <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mb-0.5">
                    Date & Time
                  </Text>
                  <Text className="text-base font-bold text-brand dark:text-brand-fg">
                    {new Date(c.scheduledAt).toLocaleDateString('en-GB', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </Text>
                  <Text className="text-sm font-semibold text-primary">
                    {new Date(c.scheduledAt).toLocaleTimeString('en-GB', {
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </Text>
                </View>
              )}
              <InfoRow
                label="Method"
                value={c.meetingMethod === 'phone' ? '📞 Phone call'
                  : c.meetingMethod === 'video' ? '💻 Video call'
                  : '📍 In person'}
              />
              {c.meetingLink && (
                <InfoRow label="Meeting link" value={c.meetingLink} />
              )}
              {c.meetingPhone && (
                <InfoRow label="Phone number" value={c.meetingPhone} />
              )}
            </View>
          )}

          {/* ── Completed: outcome card ── */}
          {isCompleted && c.outcome && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2.5">
                📝 Session Summary
              </Text>
              <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted mb-3">
                {c.outcome}
              </Text>
              {c.nextSteps && (
                <>
                  <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1.5">
                    ➡️ Next Steps
                  </Text>
                  <Text className="text-sm font-sans leading-5 text-[#4A6A82] dark:text-brand-fg-muted">
                    {c.nextSteps}
                  </Text>
                </>
              )}
              {c.relatedSwitch && (
                <Pressable
                  onPress={() => router.push(`/(app)/more/switches/${(c.relatedSwitch as any)._id}` as any)}
                  className="mt-3 bg-primary/8 border border-primary/20 rounded-banner p-3 flex-row items-center justify-between"
                >
                  <Text className="text-sm font-semibold text-primary">
                    🔄 View Related Switch
                  </Text>
                  <Text className="text-xs font-sans text-primary">
                    {(c.relatedSwitch as any).switchNumber} →
                  </Text>
                </Pressable>
              )}
            </View>
          )}

          {/* ── Rating ── */}
          {needsRating && (
            <StarRating
              consultationId={c._id}
              onSubmit={(rating, comment) => submitRating(c._id, rating, comment)}
              isSubmitting={isRating}
            />
          )}

          {/* Existing rating */}
          {isCompleted && c.rating && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-2">Your Rating</Text>
              <View className="flex-row gap-1 mb-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Text key={s} style={{ fontSize: 18 }}>
                    {s <= c.rating! ? '⭐' : '☆'}
                  </Text>
                ))}
              </View>
              {c.ratingComment && (
                <Text className="text-sm font-sans italic text-[#4A6A82] dark:text-brand-fg-muted">
                  "{c.ratingComment}"
                </Text>
              )}
            </View>
          )}

          {/* ── Session details ── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Booking Details
            </Text>
            <InfoRow label="Reference"     value={c.consultationNumber} />
            <InfoRow label="Session"       value={c.label ?? `${c.duration} min`} />
            <InfoRow label="Duration"      value={`${c.duration} minutes`} />
            <InfoRow
              label="Meeting method"
              value={c.meetingMethod === 'phone' ? 'Phone' : c.meetingMethod === 'video' ? 'Video Call' : 'In Person'}
            />
            <InfoRow label="Amount paid"   value={`£${c.price}`} />
            <InfoRow label="Payment"       value={c.payment?.status === 'succeeded' ? '✅ Paid' : c.payment?.status ?? 'Pending'} />
            {c.clientNotes && <InfoRow label="Your notes" value={c.clientNotes} />}
          </View>

          {/* ── Cancelled / No-show ── */}
          {(c.status === 'cancelled' || c.status === 'no_show') && (
            <View className="bg-muted dark:bg-border/20 rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-[#4A6A82] dark:text-brand-fg-muted mb-1">
                {c.status === 'no_show' ? '⚠️ No-show recorded' : '❌ Booking Cancelled'}
              </Text>
              {c.cancellationReason && (
                <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  {c.cancellationReason}
                </Text>
              )}
              {c.cancelledAt && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1">
                  {new Date(c.cancelledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              )}
            </View>
          )}

          {/* ── Refunded ── */}
          {c.status === 'refunded' && (
            <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/20">
              <Text className="text-sm font-bold text-brand-teal mb-1">💰 Payment Refunded</Text>
              <Text className="text-sm font-sans text-brand-teal/80">
                Your refund of £{c.payment?.refundAmount ? (c.payment.refundAmount / 100).toFixed(2) : c.price} has been processed.
                It may take 3–5 business days to appear on your statement.
              </Text>
            </View>
          )}

          {/* ── Legal ── */}
          <View className="bg-primary/6 dark:bg-brand-selected rounded-banner p-3 border border-primary/15">
            <Text className="text-xs font-sans leading-[17px] text-[#4A6A82] dark:text-brand-fg-muted">
              Payments processed securely by Stripe. Cancellations made 24+ hours in advance may be eligible for a refund at our discretion.
            </Text>
          </View>

          {/* ── Cancel button ── */}
          {canCancelNow && !isCancelling && (
            <Pressable
              onPress={handleCancel}
              className="bg-destructive/10 border border-destructive/20 h-11 rounded-banner items-center justify-center"
            >
              <Text className="text-sm font-semibold text-destructive">Cancel Booking</Text>
            </Pressable>
          )}

          {isCancelling && (
            <View className="items-center py-3">
              <ActivityIndicator color="#2272A6" />
            </View>
          )}

          {/* ── Book another ── */}
          {['completed', 'cancelled', 'refunded', 'no_show'].includes(c.status) && (
            <Pressable
              onPress={() => router.push('/(app)/more/consultations/book' as any)}
              className="bg-primary h-11 rounded-card items-center justify-center"
            >
              <Text style={{ color: '#ffffff' }} className="text-sm font-bold">
                Book Another Consultation
              </Text>
            </Pressable>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}