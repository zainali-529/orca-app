import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { AuthHeader } from '@/components/shared/auth-header';
import { KeyboardView } from '@/components/shared/keyboard-view';
import { useAuthStore } from '@/lib/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { z } from 'zod';

const registerSchema = z
  .object({
    firstName: z.string().trim().min(2, 'At least 2 characters'),
    lastName: z.string().trim().min(2, 'At least 2 characters'),
    email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
    phone: z.string().optional(),
    password: z
      .string()
      .min(8, 'At least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

function UserPlusIcon() {
  return (
    <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
      <Path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="#2DD4A0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      />
      <Path d="M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" fill="none" stroke="#2DD4A0" strokeWidth="2" />
      <Path d="M19 8v6M22 11h-6" stroke="#2DD4A0" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function BackButton() {
  return (
    <Link href="/(auth)/login" asChild>
      <Pressable hitSlop={12} className="flex-row items-center gap-2">
        <ArrowLeft size={18} color="#8BA8C4" />
        <Text style={{ color: '#8BA8C4', fontSize: 14 }}>Sign in</Text>
      </Pressable>
    </Link>
  );
}

export default function RegisterScreen() {
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const lastNameRef = React.useRef<any>(null);
  const emailRef = React.useRef<any>(null);
  const phoneRef = React.useRef<any>(null);
  const passwordRef = React.useRef<any>(null);
  const confirmRef = React.useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setApiError(null);
    try {
      await registerUser({
        firstName: data.firstName, lastName: data.lastName,
        email: data.email, phone: data.phone || undefined, password: data.password,
      });
      router.replace('/(app)');
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Registration failed. Please try again.');
    }
  };

  return (
    <KeyboardView>

      <AuthHeader
        icon={<UserPlusIcon />}
        title="Create account"
        subtitle="Get started with Energy Broker"
        topLeft={<BackButton />}
      />

      <View className="-mt-5 flex-1 rounded-t-3xl bg-background px-6 pb-10 pt-8">

        {apiError && (
          <View className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{apiError}</Text>
          </View>
        )}

        <View className="gap-4">

          {/* Name row */}
          <View className="flex-row gap-3">
            <View className="flex-1 gap-2">
              <Label>First name</Label>
              <Controller control={control} name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input placeholder="John" autoCapitalize="words" returnKeyType="next"
                    onSubmitEditing={() => lastNameRef.current?.focus()}
                    onBlur={onBlur} onChangeText={onChange} value={value}
                    className={errors.firstName ? 'border-destructive' : ''} />
                )} />
              {errors.firstName && <Text className="text-xs text-destructive">{errors.firstName.message}</Text>}
            </View>
            <View className="flex-1 gap-2">
              <Label>Last name</Label>
              <Controller control={control} name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input ref={lastNameRef} placeholder="Smith" autoCapitalize="words" returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    onBlur={onBlur} onChangeText={onChange} value={value}
                    className={errors.lastName ? 'border-destructive' : ''} />
                )} />
              {errors.lastName && <Text className="text-xs text-destructive">{errors.lastName.message}</Text>}
            </View>
          </View>

          {/* Email */}
          <View className="gap-2">
            <Label>Email address</Label>
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input ref={emailRef} placeholder="john@example.com" keyboardType="email-address"
                  autoCapitalize="none" returnKeyType="next"
                  onSubmitEditing={() => phoneRef.current?.focus()}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  className={errors.email ? 'border-destructive' : ''} />
              )} />
            {errors.email && <Text className="text-xs text-destructive">{errors.email.message}</Text>}
          </View>

          {/* Phone */}
          <View className="gap-2">
            <View className="flex-row items-center gap-2">
              <Label>Phone number</Label>
              <Text className="text-xs text-muted-foreground">(optional)</Text>
            </View>
            <Controller control={control} name="phone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input ref={phoneRef} placeholder="07911 123456" keyboardType="phone-pad"
                  returnKeyType="next" onSubmitEditing={() => passwordRef.current?.focus()}
                  onBlur={onBlur} onChangeText={onChange} value={value} />
              )} />
          </View>

          {/* Password */}
          <View className="gap-2">
            <Label>Password</Label>
            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input ref={passwordRef} placeholder="Min 8 chars, uppercase + number"
                    secureTextEntry={!showPassword} autoCapitalize="none" returnKeyType="next"
                    onSubmitEditing={() => confirmRef.current?.focus()}
                    onBlur={onBlur} onChangeText={onChange} value={value}
                    className={errors.password ? 'border-destructive pr-12' : 'pr-12'} />
                  <Pressable className="absolute right-3 top-2.5" onPress={() => setShowPassword(p => !p)} hitSlop={12}>
                    {showPassword ? <EyeOff size={20} color="#8BA8C4" /> : <Eye size={20} color="#8BA8C4" />}
                  </Pressable>
                </View>
              )} />
            {errors.password && <Text className="text-xs text-destructive">{errors.password.message}</Text>}
          </View>

          {/* Confirm */}
          <View className="gap-2">
            <Label>Confirm password</Label>
            <Controller control={control} name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input ref={confirmRef} placeholder="••••••••"
                    secureTextEntry={!showConfirm} autoCapitalize="none" returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    onBlur={onBlur} onChangeText={onChange} value={value}
                    className={errors.confirmPassword ? 'border-destructive pr-12' : 'pr-12'} />
                  <Pressable className="absolute right-3 top-2.5" onPress={() => setShowConfirm(p => !p)} hitSlop={12}>
                    {showConfirm ? <EyeOff size={20} color="#8BA8C4" /> : <Eye size={20} color="#8BA8C4" />}
                  </Pressable>
                </View>
              )} />
            {errors.confirmPassword && <Text className="text-xs text-destructive">{errors.confirmPassword.message}</Text>}
          </View>

          <Button onPress={handleSubmit(onSubmit)} disabled={isLoading} className="mt-2 h-12 rounded-xl">
            <Text className="text-base font-semibold">
              {isLoading ? 'Creating account...' : 'Create account'}
            </Text>
          </Button>

        </View>

        <View className="mt-7 flex-row items-center justify-center gap-1">
          <Text className="text-sm text-muted-foreground">Already have an account?</Text>
          <Link href="/(auth)/login" asChild>
            <Pressable hitSlop={8}>
              <Text className="text-sm font-semibold text-primary">Sign in</Text>
            </Pressable>
          </Link>
        </View>

      </View>
    </KeyboardView>
  );
}