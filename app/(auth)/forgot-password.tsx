import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AuthHeader } from '@/components/shared/auth-header';
import { KeyboardView } from '@/components/shared/keyboard-view';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { ArrowLeft, Mail } from 'lucide-react-native';
import * as React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { z } from 'zod';

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email'),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

function BackButton() {
  return (
    <Pressable onPress={() => router.back()} hitSlop={12} className="flex-row items-center gap-2">
      <Icon as={ArrowLeft} size={18} className="text-muted-foreground" />
      <Text className="text-sm text-muted-foreground">Back</Text>
    </Pressable>
  );
}

export default function ForgotPasswordScreen() {
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const { control, handleSubmit, formState: { errors }, getValues } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: ForgotFormData) => {
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      setSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <View className="flex-1 bg-background">
        <AuthHeader
          icon={<Icon as={Mail} size={26} className="text-primary" />}
          title="Check your email"
          subtitle="Reset link has been sent"
          topLeft={<BackButton />}
        />
        <View className="-mt-5 rounded-t-3xl bg-background px-6 pb-10 pt-8">
          <View className="rounded-2xl border border-border bg-muted/30 p-5">
            <Text className="mb-1 font-medium text-foreground">Email sent to</Text>
            <Text className="font-semibold text-primary">{getValues('email')}</Text>
            <Text className="mt-3 text-sm leading-relaxed text-muted-foreground">
              If an account exists for this email, you'll receive a password reset link shortly.
              Check your spam folder if you don't see it.
            </Text>
          </View>
          <Button onPress={() => router.replace('/(auth)/login')} className="mt-6 h-12 rounded-xl">
            <Text className="text-base font-semibold">Back to sign in</Text>
          </Button>
          <Button variant="ghost" onPress={() => setSubmitted(false)} className="mt-3 h-12">
            <Text className="text-sm text-muted-foreground">Try a different email</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardView>
      <AuthHeader
        icon={<Icon as={Mail} size={26} className="text-primary" />}
        title="Reset password"
        subtitle="We'll send you a reset link"
        topLeft={<BackButton />}
      />
      <View className="-mt-5 flex-1 rounded-t-3xl bg-background px-6 pb-10 pt-8">
        <Text className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Enter the email address associated with your account and we'll send you a link to reset
          your password.
        </Text>
        <View className="gap-4">
          <View className="gap-2">
            <Label>Email address</Label>
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="john@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  onBlur={onBlur} onChangeText={onChange} value={value}
                  className={errors.email ? 'border-destructive' : ''} />
              )} />
            {errors.email && <Text className="text-xs text-destructive">{errors.email.message}</Text>}
          </View>
          <Button onPress={handleSubmit(onSubmit)} disabled={isLoading} className="mt-1 h-12 rounded-xl">
            <Text className="text-base font-semibold">
              {isLoading ? 'Sending...' : 'Send reset link'}
            </Text>
          </Button>
        </View>
      </View>
    </KeyboardView>
  );
}