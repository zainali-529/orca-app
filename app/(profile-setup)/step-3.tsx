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
import Svg, { Path } from 'react-native-svg';
import { z } from 'zod';

const UK_POSTCODE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

const addrSchema = z.object({
  line1:    z.string().trim().min(1, 'Address line 1 is required'),
  line2:    z.string().trim().optional(),
  city:     z.string().trim().min(1, 'City is required'),
  county:   z.string().trim().optional(),
  postcode: z.string().trim().regex(UK_POSTCODE, 'Enter a valid UK postcode (e.g. M1 1AA)'),
});

const schema = z.object({
  billing:     addrSchema,
  sameAddress: z.boolean(),
  supply:      addrSchema.optional(),
}).refine(
  (d) => d.sameAddress || (d.supply?.line1 && d.supply?.city && d.supply?.postcode),
  { message: 'Supply address is required when different from billing', path: ['supply', 'line1'] },
);

type FormData = z.infer<typeof schema>;

// ─── Address field group ──────────────────────────────────────────────────────

function AddrFields({
  prefix,
  control,
  errors,
}: {
  prefix: 'billing' | 'supply';
  control: any;
  errors: any;
}) {
  const e = errors[prefix] ?? {};

  return (
    <View className="gap-3">

      {/* Address line 1 */}
      <View className="gap-1.5">
        <Label>Address line 1</Label>
        <Controller
          control={control}
          name={`${prefix}.line1`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="10 Business Park"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              className={e.line1 ? 'border-destructive' : ''}
            />
          )}
        />
        {e.line1 && (
          <Text className="text-xs text-destructive">{e.line1.message}</Text>
        )}
      </View>

      {/* Address line 2 (optional) */}
      <View className="gap-1.5">
        <View className="flex-row gap-1.5">
          <Label>Address line 2</Label>
          {/* text-xs = 11px / 14px lh  (config › fontSize.11) */}
          <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
            (optional)
          </Text>
        </View>
        <Controller
          control={control}
          name={`${prefix}.line2`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Unit 5"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
      </View>

      {/* City + Postcode side by side */}
      <View className="flex-row gap-2.5">
        <View className="flex-1 gap-1.5">
          <Label>City</Label>
          <Controller
            control={control}
            name={`${prefix}.city`}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="Manchester"
                autoCapitalize="words"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={e.city ? 'border-destructive' : ''}
              />
            )}
          />
          {e.city && (
            <Text className="text-xs text-destructive">{e.city.message}</Text>
          )}
        </View>

        <View className="flex-1 gap-1.5">
          <Label>Postcode</Label>
          <Controller
            control={control}
            name={`${prefix}.postcode`}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                placeholder="M1 1AA"
                autoCapitalize="characters"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                className={e.postcode ? 'border-destructive' : ''}
              />
            )}
          />
          {e.postcode && (
            <Text className="text-xs text-destructive">{e.postcode.message}</Text>
          )}
        </View>
      </View>

      {/* County (optional) */}
      <View className="gap-1.5">
        <View className="flex-row gap-1.5">
          <Label>County</Label>
          <Text className="text-xs text-[#4A6A82] dark:text-brand-fg-muted">
            (optional)
          </Text>
        </View>
        <Controller
          control={control}
          name={`${prefix}.county`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Greater Manchester"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value ?? ''}
            />
          )}
        />
      </View>

    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Step3Screen() {
  const { saveStep3, isLoading } = useProfileStore();

  const [sameAddress, setSameAddress] = React.useState(true);
  const [apiError,    setApiError]    = React.useState('');

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      billing:     { line1: '', line2: '', city: '', county: '', postcode: '' },
      sameAddress: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    setApiError('');
    try {
      await saveStep3({
        billingAddress: {
          line1:    data.billing.line1,
          line2:    data.billing.line2    || undefined,
          city:     data.billing.city,
          county:   data.billing.county   || undefined,
          postcode: data.billing.postcode.toUpperCase(),
        },
        sameAddress,
        supplyAddress: (!sameAddress && data.supply)
          ? {
              line1:    data.supply.line1,
              line2:    data.supply.line2    || undefined,
              city:     data.supply.city,
              county:   data.supply.county   || undefined,
              postcode: data.supply.postcode.toUpperCase(),
            }
          : undefined,
      });
      router.push('/(profile-setup)/step-4');
    } catch (e: any) {
      setApiError(e?.response?.data?.message ?? 'Something went wrong');
    }
  };

  return (
    <View className="flex-1 bg-background">

      <SetupHeader
        currentStep={3}
        totalSteps={5}
        title="What's your address?"
        subtitle="Your billing and energy supply address for UK accounts."
        onBack={() => router.back()}
      />

      {/* ── Scrollable form ─────────────────────────────────────────────── */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Billing address card ─────────────────────────────────────── */}
        <View className="bg-card rounded-2xl p-5 mb-3 border border-border">
          {/* text-sm = 14px / 20px lh  (config › fontSize.sm) */}
          <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-3.5">
            Billing Address
          </Text>
          <AddrFields prefix="billing" control={control} errors={errors} />
        </View>

        {/* ── Same-address checkbox row ────────────────────────────────── */}
        {/* p-3.5 = 14px  (Tailwind default › 3.5 × 4px)
            gap-3 = 12px  (Tailwind default › 3 × 4px)
            rounded-xl = 12px (Tailwind default)                          */}
        <Pressable
          onPress={() => setSameAddress(!sameAddress)}
          className="flex-row items-center gap-3 p-3.5 rounded-xl mb-3 bg-card border border-border"
        >
          {/* Checkbox
              w-5.5 h-5.5 = 22px  (config › spacing.5.5)
              rounded-md  = calc(var(--radius) - 2px) ≈ 5px (config › borderRadius.md)
              borderWidth 1.5 unchecked — kept as style prop               */}
          <View
            className={[
              'w-5.5 h-5.5 rounded-md items-center justify-center',
              sameAddress ? 'bg-primary' : 'border-border',
            ].join(' ')}
            style={{ borderWidth: sameAddress ? 0 : 1.5 }}
          >
            {sameAddress && (
              <Svg width="12" height="12" viewBox="0 0 12 12">
                <Path
                  d="M2 6l3 3 5-5"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            )}
          </View>

          {/* text-sm = 14px  (config › fontSize.sm) */}
          <Text className="flex-1 text-sm font-sans text-brand dark:text-brand-fg">
            Supply address same as billing
          </Text>
        </Pressable>

        {/* ── Supply address card (conditional) ───────────────────────── */}
        {!sameAddress && (
          <View className="bg-card rounded-2xl p-5 mb-3 border border-border">
            <Text className="text-sm font-semibold text-brand dark:text-brand-fg mb-3.5">
              Supply Address
            </Text>
            <AddrFields prefix="supply" control={control} errors={errors} />
          </View>
        )}

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
            style color  = white forced — custom Text component fix        */}
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