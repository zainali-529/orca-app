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
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [selectedEmp, setSelectedEmp] = React.useState<string | null>(
    profile?.numberOfEmployees ?? null
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
      // Convert empty strings to undefined — backend regex validators reject empty strings
      await saveStep2({
        companyName:       data.companyName       || undefined,
        companyNumber:     data.companyNumber      || undefined,
        vatNumber:         data.vatNumber          || undefined,
        businessPhone:     data.businessPhone      || undefined,
        businessEmail:     data.businessEmail      || undefined,
        numberOfEmployees: selectedEmp             ?? undefined,
      });
      router.push('/(profile-setup)/step-3');
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
  const cardBg  = isDark ? '#132030' : '#FFFFFF';
  const mutedFg = isDark ? '#7AAEC8' : '#4A6A82';
  const borderC = isDark ? '#1E3A52' : '#E5EDF3';
  const chipBdr = isDark ? '#1E3A52' : '#D5DEE8';

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <SetupHeader
        currentStep={2}
        totalSteps={5}
        title="Tell us about your business"
        subtitle="Used for quote generation and compliance documents."
        onBack={() => router.back()}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, padding: 20,
          gap: 16, borderWidth: 1, borderColor: borderC,
        }}>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Label>Company name</Label>
              <Text style={{ color: '#E24B4A', fontSize: 12 }}>*</Text>
            </View>
            <Controller control={control} name="companyName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="Acme Energy Ltd" autoCapitalize="words"
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  className={errors.companyName ? 'border-destructive' : ''} />
              )} />
            {errors.companyName && (
              <Text className="text-xs text-destructive">{errors.companyName.message}</Text>
            )}
          </View>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Label>Companies House number</Label>
              <Text style={{ color: mutedFg, fontSize: 11 }}>(optional)</Text>
            </View>
            <Controller control={control} name="companyNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="12345678" autoCapitalize="characters"
                  maxLength={8} onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Label>VAT number</Label>
              <Text style={{ color: mutedFg, fontSize: 11 }}>(optional)</Text>
            </View>
            <Controller control={control} name="vatNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="GB123456789" autoCapitalize="characters"
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Label>Number of employees</Label>
              <Text style={{ color: mutedFg, fontSize: 11 }}>(optional)</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {EMP_OPTIONS.map((opt) => (
                <Pressable key={opt} onPress={() => setSelectedEmp(selectedEmp === opt ? null : opt)}>
                  <View style={{
                    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selectedEmp === opt ? '#2272A6' : chipBdr,
                    backgroundColor: selectedEmp === opt
                      ? isDark ? '#1A3A54' : '#EDF5FB'
                      : isDark ? '#0D2C40' : '#F8FAFC',
                  }}>
                    <Text style={{
                      fontSize: 13,
                      color: selectedEmp === opt ? '#2272A6' : mutedFg,
                      fontFamily: 'Poppins',
                    }}>{opt}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Label>Business phone</Label>
            <Controller control={control} name="businessPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="01234 567890" keyboardType="phone-pad"
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          <View style={{ gap: 6 }}>
            <Label>Business email</Label>
            <Controller control={control} name="businessEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="info@company.co.uk" keyboardType="email-address"
                  autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value}
                  className={errors.businessEmail ? 'border-destructive' : ''} />
              )} />
            {errors.businessEmail && (
              <Text className="text-xs text-destructive">{errors.businessEmail.message}</Text>
            )}
          </View>
        </View>
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
