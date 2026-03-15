import * as React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ScrollViewProps,
} from 'react-native';

interface KeyboardViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

/**
 * Wraps screen content so inputs scroll above the keyboard on both platforms.
 * iOS: KeyboardAvoidingView padding mode lifts the view up.
 * Android: app.json softwareKeyboardLayoutMode="pan" handles it natively,
 *          so we just need a ScrollView.
 */
export function KeyboardView({ children, contentContainerClassName, ...props }: KeyboardViewProps) {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName={
          contentContainerClassName ?? 'flex-grow'
        }
        {...props}>
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}