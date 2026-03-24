import { useAuthStore } from '@/lib/store/auth.store';
import { useProfileStore } from '@/lib/store/profile.store';
import { Redirect, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ActivityIndicator, View, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Home, Zap, FileText, FolderOpen, Menu } from 'lucide-react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function TabBarButton({ onPress, onLongPress, isFocused, label, activeColor, inactiveColor, isDark, icon: Icon }: any) {
  // Use a faster spring configuration for snappier interactions
  const springConfig = { damping: 15, stiffness: 250, mass: 1 };
  const timingConfig = { duration: 150 };

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      // Very slight lift, or keep it 0 if you don't want vertical movement
      transform: [
        { translateY: withSpring(isFocused ? -2 : 0, springConfig) },
      ],
    };
  }, [isFocused]);

  const animatedBgStyle = useAnimatedStyle(() => {
    return {
      // The background pill scales up quickly
      opacity: withTiming(isFocused ? 1 : 0, timingConfig),
      transform: [{ scaleX: withSpring(isFocused ? 1 : 0.4, springConfig) }, { scaleY: withSpring(isFocused ? 1 : 0.4, springConfig) }]
    }
  }, [isFocused]);

  // Determine icon and text colors
  // Inactive: light mode -> dark (#000), dark mode -> light (#FFF)
  // Active: theme primary color (or custom active color)
  const currentIconColor = isFocused ? (isDark ? '#2272A6' : '#2272A6') : inactiveColor;
  const currentTextColor = isFocused ? (isDark ? '#FFFFFF' : '#000000') : inactiveColor;
  
  // The background pill color for active state
  // Using a translucent version of the primary color or a specific brand color
  const activeBgColor = isDark ? 'rgba(34, 114, 166, 0.25)' : 'rgba(34, 114, 166, 0.15)'; // Example green-ish or brand color

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabButton}
    >
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          styles.iconBg, 
          { backgroundColor: activeBgColor }, 
          animatedBgStyle
        ]} />
        <Icon color={currentIconColor} size={22} strokeWidth={isFocused ? 2.5 : 2} />
      </Animated.View>
      
      <Animated.Text style={[
        styles.tabLabel,
        { 
          color: currentTextColor,
          fontWeight: isFocused ? '600' : '500',
        }
      ]}>
        {label}
      </Animated.Text>
    </Pressable>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  
  const bgColor = isDark ? '#111214' : '#FFFFFF'; // Card background from theme
  
  // Inactive icons should be light in dark mode, dark in light mode
  const inactiveTint = isDark ? '#A0A0A0' : '#606060'; 
  const activeTint = '#2272A6'; // We handle the active contrast inside TabBarButton
  const borderColor = isDark ? '#2D2F31' : '#EBEBEB'; // Divider color

  const icons: any = {
    index: Home,
    tariffs: Zap,
    quotes: FileText,
    documents: FolderOpen,
    more: Menu,
  };

  return (
    <View style={[
      styles.tabBarContainer,
      {
        backgroundColor: bgColor,
        borderTopColor: borderColor,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
        height: 65 + (insets.bottom > 0 ? insets.bottom : 12),
      }
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        
        // Only render tabs that are explicitly defined in our icons object
        if (!icons[route.name]) return null;

        const label = options.title !== undefined ? options.title : route.name;
        const isFocused = state.index === index;
        const Icon = icons[route.name] || Home;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

        return (
          <TabBarButton
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            isFocused={isFocused}
            label={label as string}
            activeColor={activeTint}
            inactiveColor={inactiveTint}
            isDark={isDark}
            icon={Icon}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    height: '100%',
  },
  iconContainer: {
    width: 64, // Wider for pill shape
    height: 32, // Shorter height for horizontal pill
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16, // Pill rounded edges
  },
  iconBg: {
    borderRadius: 16, // Pill rounded edges
  },
  tabLabel: {
    position: 'absolute',
    top: 37,
    fontSize: 12,
    fontFamily: 'Poppins',
    fontWeight: '500',
  }
});

export default function AppLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { onboardingStatus, loadOnboardingStatus } = useProfileStore();

  React.useEffect(() => {
    if (isAuthenticated) loadOnboardingStatus();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (onboardingStatus === null) {
    return <LoadingScreen />;
  }

  if (!onboardingStatus.isCompleted) {
    return <Redirect href="/(profile-setup)/step-1" />;
  }

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="tariffs" options={{ title: 'Tariffs' }} />
      <Tabs.Screen name="quotes" options={{ title: 'Quotes' }} />
      <Tabs.Screen name="documents" options={{ title: 'Documents' }} />
      <Tabs.Screen name="more" options={{ title: 'More' }} />
    </Tabs>
  );
}

function LoadingScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',
      backgroundColor: isDark ? '#111214' : '#F8F7F5' }}>
      <ActivityIndicator size="large" color="#2272A6" />
    </View>
  );
}