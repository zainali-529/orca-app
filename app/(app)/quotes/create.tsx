import { Text } from '@/components/ui/text';
import { useQuoteStore } from '@/lib/store/quote.store';
import { useTariffStore } from '@/lib/store/tariff.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { useAuthStore } from '@/lib/store/auth.store';
import type { Tariff } from '@/lib/types/tariff.types';
import { router, useLocalSearchParams } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

// ─── Input field ──────────────────────────────────────────────────────────────

function Field({
  label, value, onChangeText, placeholder, hint, keyboardType = 'default', multiline,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; hint?: string; keyboardType?: any; multiline?: boolean;
}) {
  const { colorScheme } = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F0F8FF' : '#0D2C40';

  return (
    <View className="gap-1.5">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-sm font-semibold text-brand dark:text-brand-fg">{label}</Text>
        {hint && (
          <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">{hint}</Text>
        )}
      </View>
      <View className="bg-background dark:bg-card border border-border rounded-banner overflow-hidden">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A0B4C0"
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
          textAlignVertical={multiline ? 'top' : 'center'}
          style={{
            padding: 12, fontSize: 14, fontFamily: 'Poppins', color: textColor,
            minHeight: multiline ? 90 : undefined,
          }}
        />
      </View>
    </View>
  );
}

// ─── Contact method chip ──────────────────────────────────────────────────────

function ContactChip({
  id, label, icon, selected, onSelect,
}: { id: string; label: string; icon: string; selected: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} className="flex-1">
      <View
        className={[
          'p-3 rounded-xl items-center gap-1.5 border',
          selected
            ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
            : 'border-border bg-card',
        ].join(' ')}
      >
        <Text style={{ fontSize: 20 }}>{icon}</Text>
        <Text className={`text-xs font-sans ${selected ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted'}`}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Tariff preview card ──────────────────────────────────────────────────────

function TariffPreview({ tariff, onClear }: { tariff: Tariff; onClear: () => void }) {
  const elecRate = tariff.electricity?.unitRate;
  const gasRate  = tariff.gas?.unitRate;

  return (
    <View className="bg-primary/7 dark:bg-brand-selected/20 rounded-xl p-3.5 border-primary flex-row items-start gap-3"
      style={{ borderWidth: 1.5 }}>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <Text className="text-sm font-semibold text-primary" numberOfLines={1}>
            {tariff.supplier}
          </Text>
          {tariff.isGreen && <Text className="text-xs">🌿</Text>}
        </View>
        <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted" numberOfLines={1}>
          {tariff.tariffName}
        </Text>
        <View className="flex-row gap-2 mt-0.5">
          {elecRate != null && (
            <Text className="text-xs font-bold text-brand-blue-bright">⚡ {elecRate}p/kWh</Text>
          )}
          {gasRate != null && (
            <Text className="text-xs font-bold text-brand-blue-bright">🔥 {gasRate}p/kWh</Text>
          )}
        </View>
      </View>
      <Pressable onPress={onClear} hitSlop={12} className="p-1">
        <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <Path d="M18 6L6 18M6 6l12 12" stroke="#8BA8C4" strokeWidth="2" strokeLinecap="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CreateQuoteScreen() {
  const { createQuote, isCreating } = useQuoteStore();
  const { selectedTariff, loadTariff } = useTariffStore();
  const { profile } = useProfileStore();
  const { user }    = useAuthStore();

  // Incoming tariffId from deep link (e.g. from tariff detail "Request Quote" button)
  const { tariffId: incomingTariffId } = useLocalSearchParams<{ tariffId?: string }>();

  const [attachedTariff, setAttachedTariff] = React.useState<Tariff | null>(null);

  // Usage (pre-filled from profile)
  const [elecKwh,     setElecKwh]     = React.useState(profile?.energy?.annualElectricityKwh?.toString() ?? '');
  const [gasKwh,      setGasKwh]      = React.useState(profile?.energy?.annualGasKwh?.toString() ?? '');
  const [currentCost, setCurrentCost] = React.useState('');

  // Preferences
  const [preferGreen, setPreferGreen] = React.useState(profile?.preferGreenEnergy ?? false);
  const [preferFixed, setPreferFixed] = React.useState(profile?.preferFixedTariff ?? true);
  const [fuelType,    setFuelType]    = React.useState<'electricity' | 'gas' | 'dual'>('dual');

  // Contact
  const [contactMethod, setContactMethod] = React.useState<'email' | 'phone' | 'whatsapp'>(
    profile?.contactPreference ?? 'phone'
  );
  const [bestTime, setBestTime] = React.useState('');
  const [message,  setMessage]  = React.useState('');

  const [error, setError] = React.useState('');

  // Load tariff if coming from tariff detail
  React.useEffect(() => {
    if (incomingTariffId) {
      loadTariff(incomingTariffId);
    }
  }, [incomingTariffId]);

  React.useEffect(() => {
    if (selectedTariff && incomingTariffId && selectedTariff._id === incomingTariffId) {
      setAttachedTariff(selectedTariff);
    }
  }, [selectedTariff, incomingTariffId]);

  const handleSubmit = async () => {
    setError('');
    try {
      const quote = await createQuote({
        tariffId:                   attachedTariff?._id ?? null,
        annualElectricityKwh:       elecKwh    ? Number(elecKwh)    : null,
        annualGasKwh:               gasKwh     ? Number(gasKwh)     : null,
        currentSupplierAnnualCost:  currentCost ? Number(currentCost) : null,
        preferences: {
          fuelType,
          preferGreen,
          preferFixed,
          contractLength: 'no_preference',
        },
        contactDetails: {
          preferredContactMethod: contactMethod,
          bestTimeToContact:      bestTime.trim() || undefined,
        },
        message: message.trim() || undefined,
      });
      router.replace(`/(app)/quotes/${quote._id}` as any);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? 'Failed to submit request. Please try again.');
    }
  };

  const FUEL_OPTS: { id: 'electricity' | 'gas' | 'dual'; label: string; icon: string }[] = [
    { id: 'electricity', label: 'Electricity', icon: '⚡' },
    { id: 'gas',         label: 'Gas',         icon: '🔥' },
    { id: 'dual',        label: 'Both',        icon: '⚡🔥' },
  ];

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >

      {/* ── Header ─── */}
      <View className="bg-brand pt-14 pb-5 px-5">
        <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-1.5 mb-4">
          <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <Path d="M15 18l-6-6 6-6" stroke="#7AAEC8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text className="text-sm font-sans text-brand-fg-muted">Back</Text>
        </Pressable>
        <Text className="text-xl font-bold text-brand-fg">Request a Quote</Text>
        <Text className="text-sm font-sans mt-0.5 text-brand-fg-muted">
          Submit your details — our team will contact you to finalise your switch
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Profile auto-fill notice ─── */}
        <View className="bg-primary/8 rounded-xl p-3 mb-3.5 flex-row items-start gap-2 border border-primary/15">
          <Text style={{ fontSize: 14 }}>⚡</Text>
          <Text className="text-xs font-sans flex-1 leading-4 text-[#4A6A82] dark:text-brand-fg-muted">
            Your energy details, address, and contact info will be automatically included from your profile.
          </Text>
        </View>

        {/* ── Interested tariff ─── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-1">
            Interested Tariff
          </Text>
          <Text className="text-xs font-sans mb-3 text-[#4A6A82] dark:text-brand-fg-muted">
            If you saw a specific tariff, it will appear here. Or make a general request.
          </Text>

          {attachedTariff ? (
            <TariffPreview tariff={attachedTariff} onClear={() => setAttachedTariff(null)} />
          ) : (
            <View className="flex-row items-center gap-3">
              <View className="flex-1 bg-muted/50 dark:bg-border/20 rounded-xl p-3.5 border border-border border-dashed items-center">
                <Text className="text-sm font-sans text-[#4A6A82] dark:text-brand-fg-muted text-center">
                  No specific tariff selected
                </Text>
                <Text className="text-xs font-sans mt-1 text-[#4A6A82] dark:text-brand-fg-muted">
                  We'll find the best deal for you
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(app)/tariffs' as any)}
                className="bg-primary/10 border border-primary/20 rounded-xl p-3.5 items-center"
              >
                <Text className="text-xs font-semibold text-primary text-center">Browse{'\n'}Tariffs</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* ── Energy preferences ─── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5 gap-3">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg">Energy Preferences</Text>

          {/* Fuel type */}
          <View className="gap-1.5">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">Fuel type needed</Text>
            <View className="flex-row gap-2">
              {FUEL_OPTS.map((f) => (
                <Pressable key={f.id} onPress={() => setFuelType(f.id)} className="flex-1">
                  <View
                    className={[
                      'py-2.5 rounded-xl items-center border',
                      fuelType === f.id
                        ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
                        : 'border-border bg-card',
                    ].join(' ')}
                  >
                    <Text style={{ fontSize: 16 }}>{f.icon}</Text>
                    <Text className={`text-xs font-sans mt-1 ${fuelType === f.id ? 'text-primary' : 'text-[#4A6A82] dark:text-brand-fg-muted'}`}>
                      {f.label}
                    </Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Green + Fixed toggles */}
          <View className="gap-2">
            {[
              { label: 'Prefer green / renewable energy', value: preferGreen, onChange: setPreferGreen },
              { label: 'Prefer fixed rate tariff',        value: preferFixed, onChange: setPreferFixed },
            ].map((t) => (
              <Pressable key={t.label} onPress={() => t.onChange(!t.value)}
                className={['flex-row items-center gap-3 p-3.5 rounded-xl border',
                  t.value ? 'border-primary bg-primary/7 dark:bg-brand-selected' : 'border-border bg-card'].join(' ')}
              >
                <View
                  className={['w-5 h-5 rounded-full items-center justify-center',
                    t.value ? 'bg-primary' : 'border-border'].join(' ')}
                  style={{ borderWidth: t.value ? 0 : 1.5 }}
                >
                  {t.value && (
                    <Svg width="10" height="10" viewBox="0 0 10 10">
                      <Path d="M2 5l2.5 2.5L8 2.5" fill="none" stroke="#fff"
                        strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  )}
                </View>
                <Text className={`text-sm font-sans flex-1 ${t.value ? 'text-primary' : 'text-brand dark:text-brand-fg'}`}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Usage (optional override) */}
          <View className="gap-2">
            <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
              Annual usage — pre-filled from profile, override if needed
            </Text>
            <View className="flex-row gap-2.5">
              <View className="flex-1">
                <Field label="⚡ Elec (kWh/yr)" value={elecKwh} onChangeText={setElecKwh}
                  placeholder="2900" keyboardType="numeric" />
              </View>
              <View className="flex-1">
                <Field label="🔥 Gas (kWh/yr)" value={gasKwh} onChangeText={setGasKwh}
                  placeholder="11500" keyboardType="numeric" />
              </View>
            </View>
            <Field
              label="Current annual spend (£)"
              value={currentCost}
              onChangeText={setCurrentCost}
              placeholder="e.g. 1500"
              keyboardType="numeric"
              hint="(optional — for savings calc)"
            />
          </View>
        </View>

        {/* ── How to contact you ─── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5 gap-3">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg">How should we contact you?</Text>

          <View className="flex-row gap-2">
            <ContactChip id="phone"    label="Phone"    icon="📞" selected={contactMethod === 'phone'}    onSelect={() => setContactMethod('phone')} />
            <ContactChip id="email"    label="Email"    icon="📧" selected={contactMethod === 'email'}    onSelect={() => setContactMethod('email')} />
            <ContactChip id="whatsapp" label="WhatsApp" icon="💬" selected={contactMethod === 'whatsapp'} onSelect={() => setContactMethod('whatsapp')} />
          </View>

          <Field
            label="Best time to contact"
            value={bestTime}
            onChangeText={setBestTime}
            placeholder="e.g. Weekdays after 5pm"
            hint="(optional)"
          />
        </View>

        {/* ── Your message ─── */}
        <View className="bg-card rounded-card p-4 border border-border mb-3.5">
          <Text className="text-sm font-bold text-brand dark:text-brand-fg mb-3">
            Anything to add? (optional)
          </Text>
          <Field
            label=""
            value={message}
            onChangeText={setMessage}
            placeholder="E.g. I'd like to switch ASAP, I have a smart meter, I'm looking for a 2-year deal..."
            multiline
          />
        </View>

        {/* ── Contact details preview ─── */}
        {(user || profile) && (
          <View className="bg-primary/6 dark:bg-brand-selected rounded-card p-4 border border-primary/15 mb-3.5">
            <Text className="text-xs font-semibold text-primary mb-2">
              📋 Your details that will be included:
            </Text>
            <View className="gap-1">
              {user && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Name: {user.firstName} {user.lastName}
                </Text>
              )}
              {user?.email && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Email: {user.email}
                </Text>
              )}
              {(user?.phone || profile?.businessPhone) && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Phone: {user?.phone ?? profile?.businessPhone}
                </Text>
              )}
              {profile?.billingAddress?.postcode && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  Postcode: {profile.billingAddress.postcode}
                </Text>
              )}
              {profile?.energy?.mpan && (
                <Text className="text-xs font-sans text-[#4A6A82] dark:text-brand-fg-muted">
                  MPAN: {profile.energy.mpan}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Error */}
        {error ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            <Text className="text-destructive text-sm font-sans">{error}</Text>
          </View>
        ) : null}

      </ScrollView>

      {/* ── CTA ─── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border">
        <Pressable
          onPress={handleSubmit}
          disabled={isCreating}
          className={['bg-primary h-12 rounded-card items-center justify-center flex-row gap-2',
            isCreating ? 'opacity-70' : 'opacity-100'].join(' ')}
        >
          {isCreating ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <Path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="#fff"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={{ color: '#ffffff' }} className="text-base font-bold">
                Submit Quote Request
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}