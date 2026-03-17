import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';

export default function TariffsLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: isDark ? '#0E1923' : '#F0F4F8',
        },
      }}
    />
  );
}
