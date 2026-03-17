import { SetupHeader } from '@/components/shared/setup-header';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { useProfileStore } from '@/lib/store/profile.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
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
  { message: 'Supply address is required when different from billing', path: ['supply', 'line1'] }
);

type FormData = z.infer<typeof schema>;

function AddrFields({ prefix, control, errors }: { prefix: 'billing' | 'supply'; control: any; errors: any }) {
  const e = errors[prefix] ?? {};
  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 6 }}>
        <Label>Address line 1</Label>
        <Controller control={control} name={`${prefix}.line1`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input placeholder="10 Business Park" autoCapitalize="words"
              onBlur={onBlur} onChangeText={onChange} value={value}
              className={e.line1 ? 'border-destructive' : ''} />
          )} />
        {e.line1 && <Text className="text-xs text-destructive">{e.line1.message}</Text>}
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Label>Address line 2</Label>
          <Text style={{ color: '#7AAEC8', fontSize: 11 }}>(optional)</Text>
        </View>
        <Controller control={control} name={`${prefix}.line2`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input placeholder="Unit 5" autoCapitalize="words"
              onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
          )} />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1, gap: 6 }}>
          <Label>City</Label>
          <Controller control={control} name={`${prefix}.city`}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input placeholder="Manchester" autoCapitalize="words"
                onBlur={onBlur} onChangeText={onChange} value={value}
                className={e.city ? 'border-destructive' : ''} />
            )} />
          {e.city && <Text className="text-xs text-destructive">{e.city.message}</Text>}
        </View>
        <View style={{ flex: 1, gap: 6 }}>
          <Label>Postcode</Label>
          <Controller control={control} name={`${prefix}.postcode`}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input placeholder="M1 1AA" autoCapitalize="characters"
                onBlur={onBlur} onChangeText={onChange} value={value}
                className={e.postcode ? 'border-destructive' : ''} />
            )} />
          {e.postcode && <Text className="text-xs text-destructive">{e.postcode.message}</Text>}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Label>County</Label>
          <Text style={{ color: '#7AAEC8', fontSize: 11 }}>(optional)</Text>
        </View>
        <Controller control={control} name={`${prefix}.county`}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input placeholder="Greater Manchester" autoCapitalize="words"
              onBlur={onBlur} onChangeText={onChange} value={value ?? ''} />
          )} />
      </View>
    </View>
  );
}

export default function Step3Screen() {
  const { saveStep3, isLoading } = useProfileStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

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
          line1: data.billing.line1, line2: data.billing.line2 || undefined,
          city: data.billing.city, county: data.billing.county || undefined,
          postcode: data.billing.postcode.toUpperCase(),
        },
        sameAddress,
        supplyAddress: (!sameAddress && data.supply)
          ? {
              line1: data.supply.line1, line2: data.supply.line2 || undefined,
              city: data.supply.city, county: data.supply.county || undefined,
              postcode: data.supply.postcode.toUpperCase(),
            }
          : undefined,
      });
      router.push('/(profile-setup)/step-4');
    } catch (e: any) {
      setApiError(e?.response?.data?.message ?? 'Something went wrong');
    }
  };

  const bg      = isDark ? '#0E1923' : '#F0F4F8';
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SetupHeader
        currentStep={3}
        totalSteps={5}
        title="What's your address?"
        subtitle="Your billing and energy supply address for UK accounts."
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, padding: 20,
          marginBottom: 12, borderWidth: 1, borderColor: borderC,
        }}>
          <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 14,
            fontWeight: '600', fontFamily: 'Poppins-SemiBold', marginBottom: 14 }}>
            Billing Address
          </Text>
          <AddrFields prefix="billing" control={control} errors={errors} />
        </View>

        <Pressable
          onPress={() => setSameAddress(!sameAddress)}
          style={{
            flexDirection: 'row', alignItems: 'center', gap: 12,
            padding: 14, borderRadius: 12, marginBottom: 12,
            backgroundColor: cardBg, borderWidth: 1, borderColor: borderC,
          }}>
          <View style={{
            width: 22, height: 22, borderRadius: 5, borderWidth: 1.5,
            borderColor: sameAddress ? '#2272A6' : isDark ? '#1E3A52' : '#C8DCE9',
            backgroundColor: sameAddress ? '#2272A6' : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {sameAddress && (
              <Svg width="12" height="12" viewBox="0 0 12 12">
                <Path d="M2 6l3 3 5-5" fill="none" stroke="#fff"
                  strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            )}
          </View>
          <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 14,
            fontFamily: 'Poppins', flex: 1 }}>
            Supply address same as billing
          </Text>
        </Pressable>

        {!sameAddress && (
          <View style={{
            backgroundColor: cardBg, borderRadius: 16, padding: 20,
            marginBottom: 12, borderWidth: 1, borderColor: borderC,
          }}>
            <Text style={{ color: isDark ? '#F0F8FF' : '#0D2C40', fontSize: 14,
              fontWeight: '600', fontFamily: 'Poppins-SemiBold', marginBottom: 14 }}>
              Supply Address
            </Text>
            <AddrFields prefix="supply" control={control} errors={errors} />
          </View>
        )}
      </ScrollView>

      {/* ── Fixed bottom button ── */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        backgroundColor: bg,
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 36,
        borderTopWidth: 1, borderTopColor: isDark ? '#1E3A52' : '#E2EAF0', zIndex: 100,
      }}>
        {apiError ? (
          <View style={{
            backgroundColor: '#E24B4A15', borderRadius: 10,
            padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E24B4A30',
          }}>
            <Text style={{ color: '#E24B4A', fontSize: 13 }}>{apiError}</Text>
          </View>
        ) : null}
        <Pressable
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
          style={{ backgroundColor: '#2272A6', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', opacity: isLoading ? 0.7 : 1 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', fontFamily: 'Poppins-Bold' }}>
            {isLoading ? 'Saving...' : 'Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
