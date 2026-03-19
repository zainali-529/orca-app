import { SetupHeader } from '@/components/shared/setup-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, View } from 'react-native';
import { z } from 'zod';

const schema = z.object({
  companyName:   z.string().trim().min(1, 'Company name is required'),
  companyNumber: z.string().trim().optional(),
  vatNumber:     z.string().trim().optional(),
  businessPhone: z.string().trim().optional(),
  businessEmail: z.string().trim().email('Invalid email').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const EMP_OPTIONS = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function Step2Screen() {
  const { saveStep2, isLoading, profile } = useProfileStore();

  const [selectedEmp, setSelectedEmp] = React.useState<string | null>(
    profile?.numberOfEmployees ?? null,
  );
  const [apiError, setApiError] = React.useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName:   profile?.companyName   ?? '',
      companyNumber: profile?.companyNumber ?? '',
      vatNumber:     profile?.vatNumber     ?? '',
      businessPhone: profile?.businessPhone ?? '',
      businessEmail: profile?.businessEmail ?? '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await saveStep2({
        companyName:       data.companyName   || undefined,
        companyNumber:     data.companyNumber || undefined,
        vatNumber:         data.vatNumber     || undefined,
        businessPhone:     data.businessPhone || undefined,
        businessEmail:     data.businessEmail || undefined,
        numberOfEmployees: selectedEmp        ?? undefined,
      });
      router.push('/(profile-setup)/step-3');
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
        currentStep={2}
        totalSteps={5}
        title="Tell us about your business"
        subtitle="Used for quote generation and compliance documents."
        onBack={() => router.back()}
      />

      {/* ── Scrollable form ─────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-card rounded-2xl p-5 gap-4 border border-border">

          {/* ── Company name (required) ─────────────────────────────────── */}
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1">
              <Label>Company name</Label>
              <Text className="text-destructive text-xs">*</Text>
            </View>
            <Controller
              control={control}
              name="companyName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="Acme Energy Ltd"
                  autoCapitalize="words"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={errors.companyName ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.companyName && (
              <Text className="text-xs text-destructive">
                {errors.companyName.message}
              </Text>
            )}
          </View>

          {/* ── Companies House number (optional) ──────────────────────── */}
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Label>Companies House number</Label>
              {/* text-xs = 11px / 14px lh  (config › fontSize.11) */}
              <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
                (optional)
              </Text>
            </View>
            <Controller
              control={control}
              name="companyNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="12345678"
                  autoCapitalize="characters"
                  maxLength={8}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* ── VAT number (optional) ──────────────────────────────────── */}
          <View className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Label>VAT number</Label>
              <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
                (optional)
              </Text>
            </View>
            <Controller
              control={control}
              name="vatNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="GB123456789"
                  autoCapitalize="characters"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* ── Number of employees chips ───────────────────────────────── */}
          <View className="gap-2">
            <View className="flex-row items-center gap-1.5">
              <Label>Number of employees</Label>
              <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
                (optional)
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {EMP_OPTIONS.map((opt) => {
                const isSelected = selectedEmp === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setSelectedEmp(isSelected ? null : opt)}
                  >
                    {/* px-3.5 = 14px  (Tailwind default › 3.5 × 4px)
                        rounded-card = 14px … chips use full pill so rounded-full
                        bg-primary/7 = 7% opacity  (config › opacity.7)
                        dark:bg-brand-selected = #1A3A54  (config › brand.selected) */}
                    <View
                      className={[
                        'px-3.5 py-2 rounded-full border',
                        isSelected
                          ? 'border-primary bg-primary/7 dark:bg-brand-selected/20'
                          : 'border-border bg-card',
                      ].join(' ')}
                    >
                      {/* text-sm = 13px / 18px lh  (config › fontSize.13) */}
                      <Text
                        className={[
                          'text-sm font-sans',
                          isSelected
                            ? 'text-primary'
                            : 'text-[#4A6A82] dark:text-brand-fg-muted',
                        ].join(' ')}
                      >
                        {opt}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Business phone ──────────────────────────────────────────── */}
          <View className="gap-1.5">
            <Label>Business phone</Label>
            <Controller
              control={control}
              name="businessPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="01234 567890"
                  keyboardType="phone-pad"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
          </View>

          {/* ── Business email ──────────────────────────────────────────── */}
          <View className="gap-1.5">
            <Label>Business email</Label>
            <Controller
              control={control}
              name="businessEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="info@company.co.uk"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={errors.businessEmail ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.businessEmail && (
              <Text className="text-xs text-destructive">
                {errors.businessEmail.message}
              </Text>
            )}
          </View>

        </View>
      </ScrollView>

      {/* ── Fixed bottom bar ──────────────────────────────────────────────── */}
      <View className="absolute bottom-0 left-0 right-0 bg-background px-5 pt-3 pb-9 border-t border-border z-50">

        {/* Error banner
            bg-destructive/8 = 8% opacity  (config › opacity.8)
            rounded-banner   = 10px        (config › borderRadius.banner) */}
        {apiError ? (
          <View className="bg-destructive/8 rounded-banner p-3 mb-3 border border-destructive/20">
            {/* text-sm = 13px / 18px lh  (config › fontSize.13) */}
            <Text className="text-destructive text-sm font-sans">
              {apiError}
            </Text>
          </View>
        ) : null}

        {/* CTA button
            h-12         = 48px  (Tailwind default › 12 × 4px)
            rounded-card = 14px  (config › borderRadius.card)
            style color  = white forced — custom Text component className override nahi leta */}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          className={[
            'bg-primary h-12 rounded-card items-center justify-center',
            isLoading ? 'opacity-70' : 'opacity-100',
          ].join(' ')}
        >
          <Text style={{ color: '#ffffff' }} className="text-base font-bold">
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>

      </View>
    </View>
  );
}