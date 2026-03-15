import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store/auth.store';
import { Stack, router } from 'expo-router';
import { LogOut, User, Zap } from 'lucide-react-native';
import { Alert, ScrollView, View } from 'react-native';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuthStore();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerRight: () => (
            <Button variant="ghost" size="icon" onPress={handleLogout} disabled={isLoading}>
              <LogOut size={20} className="text-foreground" />
            </Button>
          ),
        }}
      />

      <ScrollView
        className="flex-1 bg-background"
        contentContainerClassName="px-4 py-6 gap-4">

        {/* Welcome card */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-3">
              <View className="size-12 items-center justify-center rounded-full bg-primary">
                <User size={24} color="white" />
              </View>
              <View className="flex-1">
                <CardTitle>
                  Welcome back, {user?.firstName}!
                </CardTitle>
                <Text variant="muted" className="mt-0.5 text-sm">
                  {user?.email}
                </Text>
              </View>
            </View>
          </CardHeader>
        </Card>

        {/* Placeholder stat cards */}
        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <Text variant="muted" className="mb-1 text-xs">Customers</Text>
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <Text variant="muted" className="mb-1 text-xs">Active Switches</Text>
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
        </View>

        <View className="flex-row gap-3">
          <Card className="flex-1">
            <CardContent className="pt-6">
              <Text variant="muted" className="mb-1 text-xs">Quotes Sent</Text>
              <Text className="text-3xl font-bold">0</Text>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardContent className="pt-6">
              <Text variant="muted" className="mb-1 text-xs">Commission</Text>
              <Text className="text-3xl font-bold">£0</Text>
            </CardContent>
          </Card>
        </View>

        {/* Coming soon modules */}
        <Card>
          <CardHeader>
            <View className="flex-row items-center gap-2">
              <Zap size={18} className="text-primary" />
              <CardTitle className="text-base">Modules coming soon</CardTitle>
            </View>
          </CardHeader>
          <CardContent>
            {[
              'Tariff Comparison',
              'Quote Generator',
              'Customer CRM',
              'Switch Tracker',
              'Document Vault',
              'Smart Meter Readings',
              'Payments',
            ].map((item) => (
              <View key={item} className="flex-row items-center gap-2 py-2">
                <View className="size-1.5 rounded-full bg-muted-foreground" />
                <Text variant="muted" className="text-sm">{item}</Text>
              </View>
            ))}
          </CardContent>
        </Card>

      </ScrollView>
    </>
  );
}