import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AuthHeader } from '@/components/shared/auth-header';
import { KeyboardView } from '@/components/shared/keyboard-view';
import { useAuthStore } from '@/lib/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { Eye, EyeOff, Zap } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError(null);
    try {
      await login(data);
      router.replace('/(app)');
    } catch (err: any) {
      setApiError(err?.response?.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <KeyboardView>

      <AuthHeader
        icon={<Icon as={Zap} size={26} className="text-primary" />}
        title="Welcome back"
        subtitle="Sign in to your account"
      />

      {/* ── Form card ── */}
      <View className="-mt-5 flex-1 rounded-t-3xl bg-background px-6 pb-10 pt-8">

        {apiError && (
          <View className="mb-5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
            <Text className="text-sm text-destructive">{apiError}</Text>
          </View>
        )}

        <View className="gap-5">

          <View className="gap-2">
            <Label>Email address</Label>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="next"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  className={errors.email ? 'border-destructive' : ''}
                />
              )}
            />
            {errors.email && (
              <Text className="text-xs text-destructive">{errors.email.message}</Text>
            )}
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Label>Password</Label>
              <Link href="/(auth)/forgot-password" asChild>
                <Pressable hitSlop={12}>
                  <Text className="text-xs font-medium text-primary">Forgot password?</Text>
                </Pressable>
              </Link>
            </View>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <View>
                  <Input
                    placeholder="••••••••"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    onSubmitEditing={handleSubmit(onSubmit)}
                    value={value}
                    className={errors.password ? 'border-destructive pr-12' : 'pr-12'}
                  />
                  <Pressable
                    className="absolute right-3 top-2.5"
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={12}>
                    <Icon as={showPassword ? EyeOff : Eye} size={20} className="text-muted-foreground" />
                  </Pressable>
                </View>
              )}
            />
            {errors.password && (
              <Text className="text-xs text-destructive">{errors.password.message}</Text>
            )}
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
            className="mt-1 h-12 rounded-xl">
            <Text className="text-base font-semibold">
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Text>
          </Button>
        </View>

        <View className="my-7 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-border" />
          <Text className="text-xs text-muted-foreground">NEW TO ENERGY BROKER?</Text>
          <View className="h-px flex-1 bg-border" />
        </View>

        <Link href="/(auth)/register" asChild>
          <Pressable className="h-12 items-center justify-center rounded-xl border border-border">
            <Text className="text-sm font-medium text-foreground">Create an account</Text>
          </Pressable>
        </Link>

      </View>
    </KeyboardView>
  );
}