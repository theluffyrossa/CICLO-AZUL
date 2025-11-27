import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AccessibilityInfo } from 'react-native';

import { colors } from '@/theme';
import { useAuthStore } from '@/store/authStore';
import { Loading } from '@/components/common/Loading';
import { UserRole } from '@/types';

import { LoginScreen } from '@/screens/auth/LoginScreen';
import { ClientNavigator } from './ClientNavigator';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { CollectionsListScreen } from '@/screens/collections/CollectionsListScreen';
import { NewCollectionScreen } from '@/screens/collections/NewCollectionScreen';
import { CollectionDetailScreen } from '@/screens/collections/CollectionDetailScreen';
import { EditCollectionScreen } from '@/screens/collections/EditCollectionScreen';
import { GravimetricDataScreen } from '@/screens/collections/GravimetricDataScreen';
import { CameraScreen } from '@/screens/collections/CameraScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { EditProfileScreen } from '@/screens/profile/EditProfileScreen';
import { ChangePinScreen } from '@/screens/profile/ChangePinScreen';
import { AccessibilitySettingsScreen } from '@/screens/profile/AccessibilitySettingsScreen';
import { PendingCollectionsScreen } from '@/screens/admin/PendingCollectionsScreen';
import { CollectionApprovalScreen } from '@/screens/admin/CollectionApprovalScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = (): React.ReactElement => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === UserRole.ADMIN;

  return (
    <Tab.Navigator
      screenOptions={({ route }: { route: { name: string } }) => ({
        tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Coletas') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Validação') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
          } else if (route.name === 'Perfil') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return (
            <Ionicons
              name={iconName}
              size={size}
              color={color}
              accessible={true}
              accessibilityLabel={`Ícone de ${route.name}`}
            />
          );
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.neutral[500],
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary[600],
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        tabBarAccessibilityLabel: `Aba ${route.name}`,
      })}
      screenListeners={{
        tabPress: (e: { target?: string }) => {
          AccessibilityInfo.announceForAccessibility(`Navegando para ${e.target?.split('-')[0]}`);
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Painel',
          tabBarAccessibilityLabel: 'Dashboard, mostra estatísticas e gráficos',
        }}
      />
      <Tab.Screen
        name="Coletas"
        component={CollectionsListScreen}
        options={{
          title: 'Coletas',
          tabBarAccessibilityLabel: 'Coletas, lista de todas as coletas registradas',
        }}
      />
      {isAdmin && (
        <Tab.Screen
          name="Validação"
          component={PendingCollectionsScreen}
          options={{
            title: 'Validação',
            tabBarAccessibilityLabel: 'Validação, coletas pendentes de aprovação',
          }}
        />
      )}
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          title: 'Perfil',
          tabBarAccessibilityLabel: 'Perfil, informações e configurações do usuário',
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = (): React.ReactElement => {
  const { isAuthenticated, isLoading, user } = useAuthStore();

  if (isLoading) {
    return <Loading showLogo={true} />;
  }

  // Determine which navigator to show based on user role
  const isClient = user?.role === UserRole.CLIENT;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background.default },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
            }}
          />
        ) : (
          <>
            {/* Show ClientNavigator for CLIENT users, MainTabs for ADMIN/OPERATOR */}
            <Stack.Screen
              name="Main"
              component={isClient ? ClientNavigator : MainTabs}
            />
            <Stack.Screen
              name="NewCollection"
              component={NewCollectionScreen}
              options={{
                headerShown: true,
                title: 'Nova Coleta',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="CollectionDetail"
              component={CollectionDetailScreen}
              options={{
                headerShown: true,
                title: 'Detalhes da Coleta',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="EditCollection"
              component={EditCollectionScreen}
              options={{
                headerShown: true,
                title: 'Editar Coleta',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="GravimetricData"
              component={GravimetricDataScreen}
              options={{
                headerShown: true,
                title: 'Dados Gravimétricos',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="Camera"
              component={CameraScreen}
              options={{
                headerShown: true,
                title: 'Capturar Foto',
                headerStyle: { backgroundColor: colors.neutral[900] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Editar Perfil',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="ChangePin"
              component={ChangePinScreen}
              options={{
                headerShown: true,
                title: 'Trocar PIN',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="AccessibilitySettings"
              component={AccessibilitySettingsScreen}
              options={{
                headerShown: true,
                title: 'Acessibilidade',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
            <Stack.Screen
              name="CollectionApproval"
              component={CollectionApprovalScreen}
              options={{
                headerShown: true,
                title: 'Aprovar Coleta',
                headerStyle: { backgroundColor: colors.primary[600] },
                headerTintColor: colors.white,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
