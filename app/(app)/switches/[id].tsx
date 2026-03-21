import { Text } from '@/components/ui/text';
import { useSwitchStore } from '@/lib/store/switch.store';
import type { SwitchFuelType, SwitchStatus, TimelineEvent } from '@/lib/types/switch.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path } from 'react-native-svg';

// ─── Status config ─────────────────────────────────────────────────

const STATUS_CFG: Record<SwitchStatus, {
  label: string; emoji: string;
  bgClass: string; textClass: string;
  desc:  string;
  step:  number;
}> = {
  requested:             {
    label: 'Switch Requested', emoji: '📋',
    bgClass: 'bg-primary/13', textClass: 'text-primary', step: 1,
    desc: 'Your switch has been requested. Your broker is preparing it.',
  },
  submitted_to_supplier: {
    label: 'Submitted to Supplier', emoji: '📤',
    bgClass: 'bg-primary/13', textClass: 'text-primary', step: 2,
    desc: 'Your broker has submitted the switch to the new supplier.',
  },
  cooling_off: {
    label: 'Cooling Off Period', emoji: '❄️',
    bgClass: 'bg-brand-blue-bright/10', textClass: 'text-brand-blue-bright', step: 3,
    desc: 'You have a statutory 14-day cooling off period. You can cancel without penalty.',
  },
  objected: {
    label: 'Objection Raised', emoji: '⚠️',
    bgClass: 'bg-orange-500/10', textClass: 'text-orange-400', step: 0,
    desc: 'Your old supplier has raised an objection. Your broker is working to resolve it.',
  },
  objection_resolved: {
    label: 'Objection Resolved', emoji: '✅',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal', step: 3,
    desc: 'The objection has been resolved. Your switch is continuing.',
  },
  in_progress: {
    label: 'Switch In Progress', emoji: '⚡',
    bgClass: 'bg-primary/13', textClass: 'text-primary', step: 4,
    desc: 'Your energy switch is in progress. Your new tariff will be applied shortly.',
  },
  pending_completion: {
    label: 'Pending Completion', emoji: '🔄',
    bgClass: 'bg-primary/13', textClass: 'text-primary', step: 5,
    desc: 'Your supplier is processing the final steps. Almost there!',
  },
  completed: {
    label: 'Switch Completed', emoji: '✅',
    bgClass: 'bg-brand-teal/8', textClass: 'text-brand-teal', step: 6,
    desc: 'Your energy switch is complete! You\'re now on your new tariff.',
  },
  cancelled: {
    label: 'Cancelled', emoji: '❌',
    bgClass: 'bg-muted dark:bg-border/20', textClass: 'text-[#4A6A82] dark:text-brand-fg-muted', step: 0,
    desc: 'This switch was cancelled.',
  },
  failed: {
    label: 'Switch Failed', emoji: '💔',
    bgClass: 'bg-destructive/8', textClass: 'text-destructive', step: 0,
    desc: 'Unfortunately this switch could not be completed. Contact your broker.',
  },
};

const FUEL_LABELS: Record<SwitchFuelType, string> = {
  electricity: '⚡ Electricity',
  gas:         '🔥 Gas',
  dual:        '⚡🔥 Dual Fuel',
};

// ─── Progress tracker ─────────────────────────────────────────────

const PROGRESS_STEPS = [
  { step: 1, label: 'Requested' },
  { step: 2, label: 'Submitted' },
  { step: 3, label: 'Cooling Off' },
  { step: 4, label: 'In Progress' },
  { step: 5, label: 'Finalising' },
  { step: 6, label: 'Complete' },
];

function ProgressTracker({ currentStep }: { currentStep: number }) {
  if (currentStep === 0) return null;

  return (
    <View className="relative">
      {/* Connector line */}
      <View className="absolute top-[18px] left-[18px] right-[18px] h-0.5 bg-border" />

      <View className="flex-row justify-between">
        {PROGRESS_STEPS.map((s) => {
          const done   = s.step < currentStep;
          const active = s.step === currentStep;

          return (
            <View key={s.step} className="items-center gap-1.5 flex-1">
              <View
                className={[
                  'w-9 h-9 rounded-full items-center justify-center z-10',
                  done   ? 'bg-brand-teal/15 border border-brand-teal/40' :
                  active ? 'bg-primary/15 border-2 border-primary' :
                           'bg-muted dark:bg-border/20 border border-border',
                ].join(' ')}
              >
                {done
                  ? <Svg width="14" height="14" viewBox="0 0 14 14"><Path d="M2.5 7l3 3L11 3.5" fill="none" stroke="#2DD4A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  : active
                  ? <View className="w-2 h-2 rounded-full bg-primary" />
                  : <View className="w-1.5 h-1.5 rounded-full bg-border" />
                }
              </View>
              <Text
                className={[
                  'text-[10px] text-center',
                  done || active
                    ? 'font-semibold text-brand dark:text-brand-fg'
                    : 'font-sans text-[#4A6A82] dark:text-brand-fg-muted',
                ].join(' ')}
                numberOfLines={2}
                style={{ maxWidth: 48 }}
              >
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

// ─── Rate box ─────────────────────────────────────────────────────

function RateBox({ label, value, unit }: { label: string; value: number | null | undefined; unit: string }) {
  if (!value) return null;
  return (
    <View className="flex-1 bg-primary/6 dark:bg-brand rounded-lg p-2.5 items-center gap-0.5">
      <Text className="text-sm font-bold text-brand-blue-bright">{value}p</Text>
      <Text className="text-xs font-sans text-center text-[#4A6A82] dark:text-brand-fg-muted leading-3">
        {unit}
      </Text>
      <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">{label}</Text>
    </View>
  );
}

// ─── Timeline event card ──────────────────────────────────────────

function TimelineEventCard({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const isStatusChange = event.type === 'status_change';
  const isClientMsg    = event.type === 'client_message';

  const date = new Date(event.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  const dotColor = isClientMsg ? 'bg-brand-blue-bright' : isStatusChange ? 'bg-primary' : 'bg-border';

  return (
    <View className="flex-row gap-3">
      {/* Dot + line */}
      <View className="items-center" style={{ width: 20 }}>
        <View className={`w-3 h-3 rounded-full mt-1 ${dotColor}`} />
        {!isLast && <View className="flex-1 w-px bg-border mt-1" style={{ minHeight: 24 }} />}
      </View>

      {/* Content */}
      <View className="flex-1 pb-4">
        <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-0.5">
          {event.title}
        </Text>
        {event.message && (
          <Text className={[
            'text-xs font-sans leading-4',
            isClientMsg ? 'text-brand-blue-bright italic' : 'text-[#4A6A82] dark:text-brand-fg-muted',
          ].join(' ')}>
            {isClientMsg ? `"${event.message}"` : event.message}
          </Text>
        )}
        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1">
          {date}
        </Text>
      </View>
    </View>
  );
}

// ─── Message modal ─────────────────────────────────────────────────

function MessageSection({
  switchId,
  currentMessage,
  onSent,
  isSending,
}: {
  switchId:       string;
  currentMessage?: string | null;
  onSent:          () => void;
  isSending:       boolean;
}) {
  const { sendMessage } = useSwitchStore();
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';

  const [editing, setEditing] = React.useState(false);
  const [text,    setText]    = React.useState(currentMessage ?? '');
  const [error,   setError]   = React.useState('');

  const handleSend = async () => {
    if (!text.trim()) { setError('Message cannot be empty'); return; }
    setError('');
    try {
      await sendMessage(switchId, text.trim());
      setEditing(false);
      onSent();
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to send message.');
    }
  };

  return (
    <View className="bg-card rounded-card p-4 border border-border">
      <View className="flex-row items-center justify-between mb-2.5">
        <Text className="text-sm font-bold text-brand dark:text-brand-fg">
          💬 Message Your Broker
        </Text>
        {!editing && (
          <Pressable onPress={() => setEditing(true)} hitSlop={12}>
            <Text className="text-xs font-semibold text-primary">
              {currentMessage ? 'Edit' : 'Add message'}
            </Text>
          </Pressable>
        )}
      </View>

      {currentMessage && !editing && (
        <View className="bg-primary/6 dark:bg-brand rounded-xl p-3 border border-primary/15 mb-2">
          <Text className="text-sm font-sans italic text-brand dark:text-brand-fg leading-5">
            "{currentMessage}"
          </Text>
        </View>
      )}

      {!currentMessage && !editing && (
        <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
          Leave a message or question for your broker.
        </Text>
      )}

      {editing && (
        <>
          {error ? (
            <View className="bg-destructive/8 rounded-banner p-2.5 mb-2.5 border border-destructive/20">
              <Text className="text-destructive text-xs font-sans">{error}</Text>
            </View>
          ) : null}

          <View className="bg-background border border-border rounded-banner overflow-hidden mb-2.5">
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="e.g. When will the switch complete? I have a smart meter."
              placeholderTextColor="#A0B4C0"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={{ padding: 12, fontSize: 14, fontFamily: 'Poppins', color: textColor, minHeight: 72 }}
            />
          </View>

          <View className="flex-row gap-2.5">
            <Pressable
              onPress={() => { setEditing(false); setText(currentMessage ?? ''); setError(''); }}
              className="flex-1 h-10 rounded-banner border border-border items-center justify-center"
            >
              <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSend}
              disabled={isSending}
              className={['flex-[2] h-10 rounded-banner bg-primary items-center justify-center',
                isSending ? 'opacity-70' : 'opacity-100'].join(' ')}
            >
              {isSending
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Send Message</Text>
              }
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────

export default function SwitchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    selectedSwitch, isLoadingDetail, isCancelling, isSendingMessage,
    loadSwitch, cancelSwitch,
  } = useSwitchStore();

  const contentOpacity = useSharedValue(0);
  const contentY       = useSharedValue(20);

  React.useEffect(() => {
    if (id) loadSwitch(id);
  }, [id]);

  React.useEffect(() => {
    if (selectedSwitch) {
      contentOpacity.value = withDelay(80, withTiming(1,  { duration: 350 }));
      contentY.value       = withDelay(80, withSpring(0,  { damping: 18 }));
    }
  }, [selectedSwitch]);

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

  if (!selectedSwitch) {
    return (
      <View className="flex-1 bg-background items-center justify-center p-8 gap-3">
        <Text className="text-base font-semibold text-brand dark:text-brand-fg">Switch not found</Text>
        <Pressable onPress={() => router.back()} className="bg-primary rounded-banner px-5 py-2.5">
          <Text style={{ color: '#ffffff' }} className="text-sm font-bold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const sw         = selectedSwitch;
  const cfg        = STATUS_CFG[sw.status];
  const isActive   = sw.isActive;
  const isCompleted = sw.status === 'completed';
  const isCancelled = sw.status === 'cancelled';
  const isFailed   = sw.status === 'failed';
  const isObjected = sw.status === 'objected';
  const canCancel  = ['requested', 'submitted_to_supplier', 'cooling_off'].includes(sw.status);

  const hasSaving       = (sw.contractDetails?.estimatedAnnualSaving ?? 0) > 0;
  const hasContractRates =
    sw.contractDetails?.electricityUnitRate ||
    sw.contractDetails?.gasUnitRate ||
    sw.contractDetails?.electricityStandingCharge ||
    sw.contractDetails?.gasStandingCharge;

  const createdDate = new Date(sw.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const handleCancel = () => {
    Alert.alert(
      'Cancel Switch',
      canCancel
        ? 'Are you sure you want to cancel this energy switch?'
        : 'This switch cannot be cancelled at this stage. Contact your broker.',
      canCancel
        ? [
            { text: 'Keep it', style: 'cancel' },
            {
              text: 'Cancel Switch', style: 'destructive',
              onPress: async () => {
                try {
                  await cancelSwitch(sw._id);
                  Alert.alert('Cancelled', 'Your switch has been cancelled.');
                } catch (e: any) {
                  Alert.alert('Error', e?.response?.data?.message ?? 'Could not cancel.');
                }
              },
            },
          ]
        : [{ text: 'OK' }]
    );
  };

  const timeline = sw.timeline ?? [];

  return (
    <View className="flex-1 bg-background">

      {/* ── Header ── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Switch Tracker</Text>
        </Pressable>

        {/* Switch number + status */}
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1 flex-wrap">
              <Text className="text-xs font-bold text-brand-blue-bright">{sw.switchNumber}</Text>
              <View className={`px-2 py-0.5 rounded-full ${cfg.bgClass}`}>
                <Text className={`text-xs font-semibold ${cfg.textClass}`}>
                  {cfg.emoji} {cfg.label}
                </Text>
              </View>
              <View className="bg-primary/15 rounded-md px-1.5 py-0.5">
                <Text className="text-xs font-semibold text-brand-blue-bright">
                  {FUEL_LABELS[sw.fuelType]}
                </Text>
              </View>
            </View>

            {/* Supplier change */}
            <View className="flex-row items-center gap-2 mt-1">
              <Text className="text-base font-semibold text-brand-fg-muted" numberOfLines={1} style={{ maxWidth: 100 }}>
                {sw.currentSupplier}
              </Text>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path d="M5 12h14M12 5l7 7-7 7" stroke="#3D9DD4"
                  strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text className="text-lg font-bold text-brand-fg" numberOfLines={1} style={{ maxWidth: 130 }}>
                {sw.newSupplier}
              </Text>
            </View>

            <Text className="text-xs font-sans mt-1 text-brand-fg-muted">
              Started {createdDate}
            </Text>
          </View>

          {/* Fuel icon */}
          <View className="w-12 h-12 rounded-xl bg-primary/13 border border-primary/25 items-center justify-center flex-shrink-0">
            <Text style={{ fontSize: 22 }}>
              {sw.fuelType === 'electricity' ? '⚡' : sw.fuelType === 'gas' ? '🔥' : '⚡'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 14, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={animStyle} className="gap-3">

          {/* ── Cooling off countdown ── */}
          {sw.status === 'cooling_off' && sw.coolingOffDaysLeft !== null && (
            <View className="bg-brand-blue-bright/10 rounded-card p-4 border border-brand-blue-bright/25">
              <View className="flex-row items-center gap-2 mb-1">
                <Text style={{ fontSize: 20 }}>❄️</Text>
                <Text className="text-base font-bold text-brand-blue-bright">
                  {sw.coolingOffDaysLeft} days cooling off remaining
                </Text>
              </View>
              <Text className="text-sm font-sans text-brand dark:text-brand-fg leading-5">
                You can cancel this switch penalty-free during the 14-day cooling off period.
                After this, you may incur exit fees from your current supplier.
              </Text>
            </View>
          )}

          {/* ── Status card with progress ── */}
          {!isCancelled && !isFailed && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-4">
                Switch Progress
              </Text>
              <ProgressTracker currentStep={cfg.step} />
              <View className={`mt-4 p-3 rounded-xl ${cfg.bgClass}`}>
                <Text className={`text-sm font-sans leading-5 ${cfg.textClass}`}>
                  {cfg.desc}
                </Text>
              </View>
            </View>
          )}

          {/* ── Cancelled / Failed banners ── */}
          {isCancelled && (
            <View className="bg-muted dark:bg-border/20 rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-[#4A6A82] dark:text-brand-fg-muted mb-1">
                ❌ Switch Cancelled
              </Text>
              {sw.cancellationReason && (
                <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Reason: {sw.cancellationReason}
                </Text>
              )}
              {sw.cancelledAt && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted mt-1">
                  {new Date(sw.cancelledAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
                </Text>
              )}
            </View>
          )}

          {isFailed && (
            <View className="bg-destructive/8 rounded-card p-4 border border-destructive/20">
              <Text className="text-sm font-bold text-destructive mb-1">💔 Switch Failed</Text>
              <Text className="text-sm font-sans text-destructive/80 leading-5">
                This switch could not be completed. Please contact your broker to understand the next steps.
              </Text>
            </View>
          )}

          {/* ── Objection ── */}
          {isObjected && (
            <View className="bg-orange-500/10 rounded-card p-4 border border-orange-500/20">
              <View className="flex-row items-center gap-2 mb-1">
                <Text style={{ fontSize: 18 }}>⚠️</Text>
                <Text className="text-sm font-bold text-orange-400">Objection from Current Supplier</Text>
              </View>
              {sw.objectionReason && (
                <Text className="text-sm font-sans text-orange-300 leading-5">
                  {sw.objectionReason}
                </Text>
              )}
              <Text className="text-xs font-sans text-orange-300/80 mt-2">
                Your broker is working to resolve this. You will be notified of any updates.
              </Text>
            </View>
          )}

          {/* ── Savings highlight ── */}
          {hasSaving && (
            <View className="bg-brand-teal/8 rounded-card p-4 border border-brand-teal/20">
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-xs font-sans text-brand-teal mb-0.5">💰 Estimated annual saving</Text>
                  <Text className="text-xl font-bold text-brand-teal">
                    £{Math.round(sw.contractDetails.estimatedAnnualSaving!).toLocaleString()} / year
                  </Text>
                </View>
                {sw.contractDetails?.exitFees ? (
                  <View className="items-end">
                    <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Exit fees</Text>
                    <Text className="text-sm font-bold text-orange-400">
                      £{sw.contractDetails.exitFees}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          )}

          {/* ── New contract details ── */}
          {sw.contractDetails?.tariffName && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
                New Contract — {sw.newSupplier}
              </Text>

              {/* Rate boxes */}
              {hasContractRates && (
                <View className="flex-row gap-2 mb-3">
                  <RateBox
                    label="Elec unit"
                    value={sw.contractDetails.electricityUnitRate}
                    unit="/kWh"
                  />
                  <RateBox
                    label="Elec standing"
                    value={sw.contractDetails.electricityStandingCharge}
                    unit="/day"
                  />
                  <RateBox
                    label="Gas unit"
                    value={sw.contractDetails.gasUnitRate}
                    unit="/kWh"
                  />
                  <RateBox
                    label="Gas standing"
                    value={sw.contractDetails.gasStandingCharge}
                    unit="/day"
                  />
                </View>
              )}

              <InfoRow label="Tariff name"   value={sw.contractDetails.tariffName} />
              <InfoRow
                label="Contract type"
                value={sw.contractDetails.contractType
                  ? sw.contractDetails.contractType.charAt(0).toUpperCase() + sw.contractDetails.contractType.slice(1)
                  : null
                }
              />
              <InfoRow
                label="Contract length"
                value={sw.contractDetails.contractLengthMonths
                  ? `${sw.contractDetails.contractLengthMonths} months`
                  : null
                }
              />
              <InfoRow
                label="Contract start"
                value={sw.contractDetails.contractStartDate
                  ? new Date(sw.contractDetails.contractStartDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                  : null
                }
              />
              <InfoRow
                label="Contract end"
                value={sw.contractDetails.contractEndDate
                  ? new Date(sw.contractDetails.contractEndDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                  : null
                }
              />
            </View>
          )}

          {/* ── Switch details ── */}
          <View className="bg-card rounded-card p-4 border border-border">
            <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
              Switch Details
            </Text>
            <InfoRow label="Switch ref"       value={sw.switchNumber} />
            <InfoRow label="Fuel type"        value={FUEL_LABELS[sw.fuelType]} />
            <InfoRow label="From supplier"    value={sw.currentSupplier} />
            <InfoRow label="To supplier"      value={sw.newSupplier} />
            <InfoRow label="Initiated by"     value={sw.initiatedBy === 'admin' ? 'Your broker' : 'You'} />
            <InfoRow
              label="Est. switch date"
              value={sw.estimatedSwitchDate
                ? new Date(sw.estimatedSwitchDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
                : null
              }
            />
            {isCompleted && sw.completedAt && (
              <InfoRow
                label="Completed on"
                value={new Date(sw.completedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
              />
            )}
          </View>

          {/* ── Meter details (if provided) ── */}
          {(sw.meterDetails?.mpan || sw.meterDetails?.mprn || sw.meterDetails?.supplyAddress?.postcode) && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
                Meter Details
              </Text>
              <InfoRow label="MPAN (Electricity)" value={sw.meterDetails.mpan} />
              <InfoRow label="MPRN (Gas)"          value={sw.meterDetails.mprn} />
              <InfoRow label="Meter serial"         value={sw.meterDetails.meterSerial} />
              <InfoRow
                label="Supply address"
                value={[
                  sw.meterDetails.supplyAddress?.line1,
                  sw.meterDetails.supplyAddress?.city,
                  sw.meterDetails.supplyAddress?.postcode,
                ].filter(Boolean).join(', ') || null}
              />
            </View>
          )}

          {/* ── Timeline ── */}
          {timeline.length > 0 && (
            <View className="bg-card rounded-card p-4 border border-border">
              <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-4">
                📅 Switch Timeline
              </Text>
              {timeline.map((event, i) => (
                <TimelineEventCard
                  key={event._id}
                  event={event}
                  isLast={i === timeline.length - 1}
                />
              ))}
            </View>
          )}

          {/* ── Message your broker ── */}
          {isActive && (
            <MessageSection
              switchId={sw._id}
              currentMessage={sw.clientMessage}
              onSent={() => loadSwitch(sw._id)}
              isSending={isSendingMessage}
            />
          )}

          {/* ── Legal note ── */}
          <View className="bg-primary/6 dark:bg-brand-selected rounded-banner p-3 border border-primary/15">
            <Text className="text-xs font-sans leading-[17px] text-[#4A6A82] dark:text-brand-fg-muted">
              Your broker manages this switch on your behalf under your signed Letter of Authority.
              All changes to your energy account are authorised by your LOA.
            </Text>
          </View>

          {/* ── Cancel button ── */}
          {canCancel && !isCancelling && (
            <Pressable
              onPress={handleCancel}
              className="bg-destructive/10 border border-destructive/20 h-11 rounded-banner items-center justify-center"
            >
              <Text className="text-sm font-semibold text-destructive">
                Cancel This Switch
              </Text>
            </Pressable>
          )}

          {isCancelling && (
            <View className="items-center py-3">
              <ActivityIndicator color="#2272A6" />
            </View>
          )}

        </Animated.View>
      </ScrollView>
    </View>
  );
}