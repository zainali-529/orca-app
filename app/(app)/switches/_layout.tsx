import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function SwitchesLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? '#111214' : '#F8F7F5',
        },
      }}
    />
  );
}