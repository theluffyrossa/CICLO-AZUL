import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { colors } from '../theme/colors';

// Client Screens
import { ClientDashboardScreen } from '../screens/client/ClientDashboardScreen';
import { ClientCollectionsScreen } from '../screens/client/ClientCollectionsScreen';
import { ClientCollectionDetailScreen } from '../screens/client/ClientCollectionDetailScreen';
import { ClientProfileScreen } from '../screens/client/ClientProfileScreen';

// Shared Screens
import { NewCollectionScreen } from '../screens/collections/NewCollectionScreen';
import { AccessibilitySettingsScreen } from '../screens/profile/AccessibilitySettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Dashboard Stack
const DashboardStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="ClientDashboard"
      component={ClientDashboardScreen}
      options={{ title: 'Dashboard' }}
    />
  </Stack.Navigator>
);

// Collections Stack
const CollectionsStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="ClientCollectionsList"
      component={ClientCollectionsScreen}
      options={{ title: 'Coletas' }}
    />
    <Stack.Screen
      name="AddCollection"
      component={NewCollectionScreen}
      options={{
        title: 'Nova Coleta',
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
    <Stack.Screen
      name="ClientCollectionDetail"
      component={ClientCollectionDetailScreen}
      options={{
        title: 'Detalhes da Coleta',
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>
);

// Profile Stack
const ProfileStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen
      name="ClientProfile"
      component={ClientProfileScreen}
      options={{ title: 'Perfil' }}
    />
    <Stack.Screen
      name="AccessibilitySettings"
      component={AccessibilitySettingsScreen}
      options={{
        title: 'Acessibilidade',
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    />
  </Stack.Navigator>
);

export const ClientNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'DashboardTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'CollectionsTab') {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === 'ProfileTab') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          height: Platform.OS === 'ios' ? 85 : 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarAccessibilityLabel: `Aba ${route.name}`,
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarAccessibilityLabel: 'Dashboard',
          tabBarAccessibilityHint: 'Navegar para o dashboard com estatísticas',
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Announce tab selection for screen readers
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              // iOS VoiceOver and Android TalkBack will automatically announce
            }
          },
        })}
      />
      <Tab.Screen
        name="CollectionsTab"
        component={CollectionsStack}
        options={{
          tabBarLabel: 'Coletas',
          tabBarAccessibilityLabel: 'Coletas',
          tabBarAccessibilityHint: 'Navegar para a lista de coletas',
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil',
          tabBarAccessibilityHint: 'Navegar para o perfil da conta',
        }}
      />
    </Tab.Navigator>
  );
};
